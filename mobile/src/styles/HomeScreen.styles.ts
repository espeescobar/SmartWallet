import { StyleSheet } from 'react-native';
import { Colors, Typography } from './App.styles';

export const styles = StyleSheet.create({
    headerRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginTop: 20,
        marginBottom: 20,
    },
    headerText: {
        flex: 1,
    },
    greeting: {
        fontSize: 22,
        fontFamily: Typography.main,
        fontWeight: '600',
        color: Colors.negro,
    },
    balanceContainer: {
        marginBottom: 32,
    },
    balanceTitle: {
        color: Colors.textoSuave,
        fontFamily: Typography.main,
        fontSize: 16,
        fontWeight: '500',
        marginBottom: 8,
    },
    balanceAmount: {
        color: Colors.negro,
        fontFamily: Typography.main,
        fontSize: 48,
        fontWeight: '800',
        letterSpacing: -1,
    },
    balanceSubtext: {
        color: Colors.textoSuave,
        fontFamily: Typography.main,
        fontSize: 14,
        marginTop: 6,
    },
    budgetBanner: {
        borderRadius: 16,
        padding: 14,
        marginBottom: 20,
        borderWidth: 1,
    },
    budgetBannerWarning: {
        backgroundColor: '#FFF8E1',
        borderColor: '#FFE082',
    },
    budgetBannerDanger: {
        backgroundColor: '#FFEBEE',
        borderColor: '#FFCDD2',
    },
    budgetBannerText: {
        fontSize: 14,
        fontFamily: Typography.main,
        fontWeight: '600',
        color: '#FF3D71',
        lineHeight: 20,
        marginBottom: 10,
    },
    budgetBannerTextDanger: {
        color: Colors.error,
    },
    budgetProgressBg: {
        height: 8,
        backgroundColor: Colors.borde,
        borderRadius: 4,
        overflow: 'hidden',
        marginBottom: 6,
    },
    budgetProgressFill: {
        height: '100%',
        borderRadius: 4,
    },
    budgetSubtext: {
        fontSize: 12,
        fontFamily: Typography.main,
        color: Colors.textoSuave,
    },
    filterScroll: {
        marginBottom: 12,
        maxHeight: 44,
    },
    filterRow: {
        flexDirection: 'row',
        gap: 8,
        paddingVertical: 4,
    },
    filterChip: {
        paddingHorizontal: 14,
        paddingVertical: 8,
        borderRadius: 20,
        backgroundColor: Colors.fondo,
        borderWidth: 1,
        borderColor: Colors.borde,
    },
    filterChipActive: {
        backgroundColor: Colors.celeste,
        borderColor: Colors.azul,
    },
    filterText: {
        fontSize: 13,
        fontFamily: Typography.main,
        color: Colors.textoSuave,
        fontWeight: '600',
    },
    filterTextActive: {
        color: Colors.azul,
    },
    movementsContainer: {
        backgroundColor: Colors.fondo,
        borderRadius: 24,
        paddingHorizontal: 16,
        marginBottom: 20,
        borderWidth: 1,
        borderColor: Colors.borde,
    },
    emptyText: {
        color: Colors.textoSuave,
        padding: 16,
        fontFamily: Typography.main,
        textAlign: 'center',
    },
    expenseItem: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: 12,
        borderBottomWidth: 1,
        borderBottomColor: Colors.borde,
    },
    expenseLeft: {
        flexDirection: 'row',
        alignItems: 'center',
        flex: 1,
    },
    iconCircle: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: Colors.blanco,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 12,
        borderWidth: 1,
        borderColor: Colors.borde,
    },
    iconText: {
        fontSize: 18,
    },
    expenseInfo: {
        flex: 1,
    },
    expenseDescription: {
        fontSize: 15,
        fontFamily: Typography.main,
        fontWeight: '600',
        color: Colors.negro,
    },
    expenseRelative: {
        fontSize: 12,
        fontFamily: Typography.main,
        color: Colors.textoSuave,
        marginTop: 2,
    },
    expenseDateTiny: {
        fontSize: 10,
        fontFamily: Typography.main,
        color: Colors.textoSuave,
        marginTop: 1,
        opacity: 0.85,
    },
    expenseAmount: {
        fontSize: 15,
        fontFamily: Typography.main,
        fontWeight: '700',
        color: Colors.negro,
        marginLeft: 8,
    },
    bottomPadding: {
        height: 10,
    },
});
