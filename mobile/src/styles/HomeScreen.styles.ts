import { StyleSheet } from 'react-native';

export const styles = StyleSheet.create({
    safeArea: { 
        flex: 1, 
        backgroundColor: '#F7F7F9' 
    },
    container: { 
        flex: 1, 
        paddingHorizontal: 24 
    },
    header: { 
        marginTop: 20, 
        marginBottom: 30 
    },
    greeting: { 
        fontSize: 22, 
        fontWeight: '600', 
        color: '#1A1A1A' 
    },
    balanceContainer: { 
        marginBottom: 40 
    },
    balanceTitle: { 
        color: '#6E6E73', 
        fontSize: 16, 
        fontWeight: '500', 
        marginBottom: 8 
    },
    balanceAmount: { 
        color: '#1A1A1A', 
        fontSize: 48, 
        fontWeight: '800', 
        letterSpacing: -1 
    },
    sectionTitle: { 
        fontSize: 18, 
        fontWeight: '700', 
        color: '#1A1A1A', 
        marginBottom: 16,
        marginTop: 10
    },
    // Estilos para los movimientos
    movementsContainer: {
        backgroundColor: '#FFFFFF',
        borderRadius: 24,
        paddingHorizontal: 16,
        paddingVertical: 8,
        marginBottom: 20,
    },
    expenseItem: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: 16,
        borderBottomWidth: 1,
        borderBottomColor: '#F0F0F2',
    },
    expenseLeft: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    iconCircle: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: '#F7F7F9',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 12,
    },
    iconText: {
        fontSize: 18,
    },
    expenseDescription: {
        fontSize: 15,
        fontWeight: '600',
        color: '#1A1A1A',
    },
    expenseDate: {
        fontSize: 12,
        color: '#6E6E73',
        marginTop: 2,
    },
    expenseAmount: {
        fontSize: 15,
        fontWeight: '700',
        color: '#1A1A1A',
    },
    bottomPadding: { 
        height: 40 
    }
});