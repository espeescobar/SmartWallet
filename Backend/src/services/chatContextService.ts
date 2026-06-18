import { dashboardService } from './dashboardService';
import { goalRepository } from '../repositories/goalRepository';

/**
 * Arma el resumen financiero AGREGADO del usuario para inyectarlo como contexto
 * del LLM. Estrategia híbrida: solo totales y agregados, nunca transacciones
 * individuales ni datos identificables. Ver docs/chatbot-arquitectura.md (sección 3).
 */

/** Formatea un monto entero como CLP: 210000 -> "$210.000" */
function clp(amount: number): string {
  return `$${amount.toLocaleString('es-CL')}`;
}

export const chatContextService = {
  /**
   * Devuelve un texto compacto con el contexto financiero del usuario, o null si
   * no hay datos relevantes (el bot opera entonces como educador general).
   */
  async buildContext(userId: string): Promise<string | null> {
    try {
      const [summary, goals] = await Promise.all([
        dashboardService.getSummary(userId),
        goalRepository.findByUserId(userId),
      ]);

      const activeGoals = goals.filter((g) => g.status === 'active');
      const hasMovements = summary.total_income > 0 || summary.total_expenses > 0;

      if (!hasMovements && activeGoals.length === 0) return null;

      const lines: string[] = [];
      lines.push(`[Contexto financiero del usuario — mes ${summary.month}]`);
      lines.push(
        `Ingresos: ${clp(summary.total_income)} · Gastos: ${clp(summary.total_expenses)} · Balance: ${clp(summary.balance)}`,
      );

      const topCategories = summary.categories.slice(0, 5);
      if (topCategories.length > 0) {
        lines.push('Top gastos:');
        for (const cat of topCategories) {
          const budget =
            cat.budget_amount != null
              ? `(presupuesto ${clp(cat.budget_amount)})${cat.total_amount > cat.budget_amount ? ' [excedido]' : ''}`
              : '(sin presupuesto)';
          lines.push(`- ${cat.category_name}: ${clp(cat.total_amount)} ${budget}`);
        }
      }

      if (activeGoals.length > 0) {
        lines.push('Metas activas:');
        for (const g of activeGoals.slice(0, 5)) {
          const pct =
            g.target_amount > 0
              ? Math.round((g.current_amount / g.target_amount) * 100)
              : 0;
          lines.push(`- ${g.title}: ${clp(g.current_amount)} / ${clp(g.target_amount)} (${pct}%)`);
        }
      }

      return lines.join('\n');
    } catch {
      // Si falla armar el contexto, el chat sigue funcionando sin él.
      return null;
    }
  },
};
