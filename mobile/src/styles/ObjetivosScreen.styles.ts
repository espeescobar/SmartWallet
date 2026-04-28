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
    addButton: { 
        backgroundColor: Colors.azul, 
        height: 56, 
        borderRadius: 16, 
        justifyContent: 'center', 
        alignItems: 'center', 
        marginTop: 10, 
        marginBottom: 40 
    },
    addButtonText: { 
        color: Colors.blanco, 
        fontFamily: Typography.bold,
        fontWeight: '700', 
        fontSize: 16 
    }
});