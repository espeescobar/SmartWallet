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
    screenTitle: { 
        fontSize: 28, 
        fontWeight: '800', 
        color: '#1A1A1A', 
        marginTop: 20 
    },
    subtitle: { 
        fontSize: 16, 
        color: '#6E6E73', 
        marginBottom: 30, 
        marginTop: 4 
    },
    // Tarjeta del total gastado
    totalCard: {
        backgroundColor: '#1A1A1A', // Fondo oscuro para resaltar
        padding: 24,
        borderRadius: 24,
        marginBottom: 30,
        alignItems: 'center',
    },
    totalTitle: {
        color: '#A1A1A8',
        fontSize: 16,
        fontWeight: '500',
        marginBottom: 8,
    },
    totalAmount: {
        color: '#FFFFFF',
        fontSize: 40,
        fontWeight: '800',
        letterSpacing: -1,
    },
    sectionTitle: { 
        fontSize: 18, 
        fontWeight: '700', 
        color: '#1A1A1A', 
        marginBottom: 16 
    },
    // Contenedores de categorías
    categoryContainer: {
        backgroundColor: '#FFFFFF',
        padding: 16,
        borderRadius: 16,
        marginBottom: 12,
    },
    categoryHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 12,
    },
    categoryName: {
        fontSize: 16,
        fontWeight: '600',
        color: '#1A1A1A',
    },
    categoryAmount: {
        fontSize: 16,
        fontWeight: '700',
        color: '#1A1A1A',
    },
    progressBarBg: {
        height: 8,
        backgroundColor: '#F0F0F2',
        borderRadius: 4,
    },
    progressBarFill: {
        height: '100%',
        borderRadius: 4,
    },
    bottomPadding: {
        height: 40,
    }
});