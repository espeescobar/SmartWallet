import { StyleSheet } from 'react-native';
import { Colors, Typography } from './App.styles'; 

export const styles = StyleSheet.create({
    card: { 
        backgroundColor: Colors.blanco, 
        padding: 20, 
        borderRadius: 24, 
        marginBottom: 30, 
        borderWidth: 1,
        borderColor: Colors.borde, 
        shadowColor: Colors.negro,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 10,
        elevation: 2 
    },
    input: { 
        backgroundColor: Colors.fondo, 
        height: 56, 
        borderRadius: 16, 
        paddingHorizontal: 16, 
        fontSize: 16, 
        fontFamily: Typography.main, 
        color: Colors.negro,
        marginBottom: 12 
    },
    categorySelector: { 
        backgroundColor: Colors.fondo, 
        height: 56, 
        borderRadius: 16, 
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
    button: { 
        backgroundColor: Colors.azul, 
        height: 56, 
        borderRadius: 16, 
        justifyContent: 'center', 
        alignItems: 'center',
        marginTop: 8
    },
    buttonText: { 
        color: Colors.blanco, 
        fontFamily: Typography.main,
        fontWeight: '700', 
        fontSize: 16 
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
        fontFamily: Typography.bold,
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