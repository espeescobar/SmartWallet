import { StyleSheet } from 'react-native';
import { Colors, Typography } from '../styles/App.styles'; // Ajusta la ruta si es necesario

export const styles_objetivos = StyleSheet.create({
    // Estados de carga y listas vacías
    loadingIndicator: {
        marginTop: 20,
    },
    emptyText: {
        color: Colors.textoSuave,
        padding: 16,
        fontFamily: Typography.main,
        textAlign: 'center',
    },

  
    suggestionContainer: {
        marginTop: 10,
        marginBottom: 10,
    },
    suggestionLabel: {
        fontSize: 14,
        color: Colors.textoSuave,
        marginBottom: 6,
        fontFamily: Typography.main,
        fontWeight: '600',
    },
 
});