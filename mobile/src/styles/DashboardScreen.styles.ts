import { StyleSheet } from 'react-native';
import { Colors, Typography } from './App.styles'; 

export const styles = StyleSheet.create({
    safeArea: { 
        flex: 1, 
        backgroundColor: Colors.blanco 
    },
    container: { 
        flex: 1, 
        paddingHorizontal: 24 
    },
    screenTitle: { 
        fontSize: 28, 
        fontFamily: Typography.header, 
        fontWeight: '800', 
        color: Colors.negro, 
        marginTop: 20 
    },
    subtitle: { 
        fontSize: 16, 
        fontFamily: Typography.main,
        color: Colors.textoSuave,   
        marginBottom: 30, 
        marginTop: 4 
    },
  
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
        fontFamily: Typography.header, 
        fontSize: 40,
        fontWeight: '800',
        letterSpacing: -1,
    },
    sectionTitle: { 
        fontSize: 18, 
        fontFamily: Typography.bold,  
        fontWeight: '700', 
        color: Colors.negro,          
        marginBottom: 16 
    },

    categoryContainer: {
        backgroundColor: Colors.blanco, 
        padding: 16,
        borderRadius: 16,
        marginBottom: 12,
        borderWidth: 1,
        borderColor: Colors.borde,
    },
    categoryHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 12,
    },
    categoryName: {
        fontSize: 16,
        fontFamily: Typography.bold,
        fontWeight: '600',
        color: Colors.negro, 
    },
    categoryAmount: {
        fontSize: 16,
        fontFamily: Typography.bold,
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
        borderTopColor: Colors.borde, // O '#F0F0F2' si no estás usando Colors.borde aquí
    },
    gastoItem: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 12,
    },
    gastoDescripcion: {
        fontSize: 14,
        fontFamily: Typography.bold, // Si no usas Typography, pon fontWeight: '600'
        color: Colors.negro,
    },
    gastoFecha: {
        fontSize: 12,
        fontFamily: Typography.main,
        color: Colors.textoSuave,
        marginTop: 2,
    },
    gastoMonto: {
        fontSize: 14,
        fontFamily: Typography.bold,
        color: Colors.negro,
    }
});