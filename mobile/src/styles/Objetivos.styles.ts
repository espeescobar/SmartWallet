import { StyleSheet } from 'react-native';
import { Colors, Typography } from './App.styles';

export const styles = StyleSheet.create({
    card: { 
        backgroundColor: Colors.fondo,
        padding: 20, 
        borderRadius: 24, 
        marginBottom: 20, 
        borderWidth: 1,
        borderColor: Colors.borde, 
        shadowColor: Colors.negro,
        shadowOffset: { width: 1, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 10,
        elevation: 2 
    },
    header: { 
        flexDirection: 'row', 
        justifyContent: 'space-between', 
        marginBottom: 12 
    },
    title: { 
        fontSize: 16, 
        fontFamily: Typography.bold,
        fontWeight: '700', 
        color: Colors.negro 
    },
    percentage: { 
        fontSize: 16, 
        fontFamily: Typography.header,
        fontWeight: '700' 
    },
    progressBg: { 
        height: 8, 
        backgroundColor: Colors.borde, 
        borderRadius: 4, 
        marginBottom: 8 
    },
    progressFill: { 
        height: '100%', 
        borderRadius: 4 
    },
    footer: { 
        flexDirection: 'row', 
        justifyContent: 'space-between' 
    },
    amountText: { 
        fontSize: 13, 
        fontFamily: Typography.main,
        color: Colors.textoSuave 
    }
});