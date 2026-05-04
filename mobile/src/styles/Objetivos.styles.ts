import { StyleSheet } from 'react-native';
import { Colors, Typography } from './App.styles';

export const styles = StyleSheet.create({
    title: { 
        fontSize: 16, 
        fontFamily: Typography.main,
        fontWeight: '700', 
        color: Colors.negro 
    },
    percentage: { 
        fontSize: 16, 
        fontFamily: Typography.main,
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

