import { StyleSheet } from 'react-native';
import { Colors, Typography } from './App.styles'; 

export const styles = StyleSheet.create({
  
    totalCard: {
        backgroundColor: Colors.fondo,
        padding: 24,
        borderRadius: 24,
        marginBottom: 30,
        alignItems: 'center',
    },
    totalTitle: {
        color: Colors.azul,
        fontFamily: Typography.main,
        fontSize: 16,
        fontWeight: '500',
        marginBottom: 8,
    },
    totalAmount: {
        color: Colors.azul,         
        fontFamily: Typography.main, 
        fontSize: 40,
        fontWeight: '800',
        letterSpacing: -1,
    },

    categoryContainer: {
        backgroundColor: Colors.blanco, 
        padding: 16,
        borderRadius: 16,
        marginBottom: 12,
        borderWidth: 1,
        borderColor: Colors.borde,
    },
    categoryName: {
        fontSize: 16,
        fontFamily: Typography.main,
        fontWeight: '600',
        color: Colors.negro, 
    },
    categoryAmount: {
        fontSize: 16,
        fontFamily: Typography.main,
        fontWeight: '700',
        color: Colors.negro, 
    },
    progressBarBg: {
        height: 8,
        backgroundColor: Colors.borde, 
        borderRadius: 4,
    },
    progressBarFill: {
        height: '100%',
        borderRadius: 4,
    
    },
    bottomPadding: {
        height: 40,
    },
    expandedList: {
        marginTop: 16,
        paddingTop: 16,
        borderTopWidth: 1,
        borderTopColor: Colors.borde,
    },
  
    gastoDescripcion: {
        fontSize: 14,
        fontFamily: Typography.main,
        color: Colors.negro,
    },
    gastoFecha: {
        fontSize: 12,
        fontFamily: Typography.main,
        color: Colors.textoSuave,
        marginTop: 2,
    }
});