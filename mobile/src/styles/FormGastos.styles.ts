import { StyleSheet } from 'react-native';
import { Colors, Typography } from './App.styles'; 

export const styles = StyleSheet.create({
    
    categorySelector: { 
        backgroundColor: Colors.fondo, 
        height: 56, 
        borderRadius: 16, 
        borderWidth: 1,
        borderColor: Colors.borde,
        paddingHorizontal: 16, 
        justifyContent: 'center', 
        marginBottom: 12 
    },
    categoryTextFilled: { 
        fontSize: 16, 
        fontFamily: Typography.main,
        color: Colors.negro 
    },
    categoryTextPlaceholder: { 
        fontSize: 16, 
        fontFamily: Typography.main, 
        color: Colors.textoSuave 
    },
    modalOverlay: { 
        flex: 1, 
        justifyContent: 'flex-end', 
        backgroundColor: 'rgba(0,0,0,0.4)' 
    },
    modalContent: { 
        backgroundColor: Colors.blanco, 
        borderTopLeftRadius: 24, 
        borderTopRightRadius: 24, 
        padding: 24, 
        maxHeight: '70%' 
    },
    modalTitle: { 
        fontSize: 20, 
        fontFamily: Typography.main,
        fontWeight: '700', 
        color: Colors.negro, 
        marginBottom: 20, 
        textAlign: 'center' 
    },
    modalItem: { 
        paddingVertical: 16, 
        borderBottomWidth: 1, 
        borderBottomColor: Colors.borde 
    },
    modalItemText: { 
        fontSize: 18, 
        fontFamily: Typography.main, 
        color: Colors.negro 
    },
    modalCloseButton: { 
        marginTop: 20, 
        backgroundColor: Colors.fondo, 
        height: 56, 
        borderRadius: 16, 
        justifyContent: 'center', 
        alignItems: 'center' 
    },
    modalCloseText: { 
        fontSize: 16, 
        fontFamily: Typography.main,
        fontWeight: '700', 
        color: Colors.azul 
    }
});