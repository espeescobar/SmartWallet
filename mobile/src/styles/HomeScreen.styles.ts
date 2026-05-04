import { StyleSheet } from 'react-native';
import { Colors, Typography } from './App.styles';

export const styles = StyleSheet.create({
    header: { 
        marginTop: 20, 
        marginBottom: 30 
    },
    greeting: { 
        fontSize: 22, 
        fontFamily: Typography.main,
        fontWeight: '600', 
        color: Colors.negro 
    },
    balanceContainer: { 
        marginBottom: 40 
    },
    balanceTitle: { 
        color: Colors.textoSuave, 
        fontFamily: Typography.main,
        fontSize: 16, 
        fontWeight: '500', 
        marginBottom: 8 
    },
    balanceAmount: { 
        color: Colors.negro, 
        fontFamily: Typography.main,
        fontSize: 48, 
        fontWeight: '800', 
        letterSpacing: -1 
    },
    movementsContainer: {
        backgroundColor: Colors.fondo,
        borderRadius: 24,
        paddingHorizontal: 16,
        marginBottom: 20,
        borderWidth: 1,
        borderColor: Colors.borde
    },
    expenseItem: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: 10,
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
        backgroundColor: Colors.fondo,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: -30,
    },
    iconText: {
        fontSize: 18,
    },
    expenseDescription: {
        fontSize: 15,
        fontFamily: Typography.main,
        fontWeight: '600',
        color: Colors.negro,
    },
    expenseDate: {
        fontSize: 12,
        fontFamily: Typography.main,
        color: Colors.textoSuave,
        marginTop: 2,
    },
    expenseAmount: {
        fontSize: 15,
        fontFamily: Typography.main,
        fontWeight: '700',
        color: Colors.negro,
    },
    bottomPadding: { 
        height: 10 
    }
});