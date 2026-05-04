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

    

    // Elementos del formulario (DatePicker y Sugerencia mensual)
    datePickerButton: {
        justifyContent: 'center',
    },
    dateText: {
        color: Colors.negro,
        fontFamily: Typography.main,
        fontSize: 16,
    },
    dateTextPlaceholder: {
        color: '#A0A0A0', // Mismo tono de tus placeholderTextColor
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