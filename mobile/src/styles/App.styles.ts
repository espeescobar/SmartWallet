import { StyleSheet } from 'react-native';


export const Colors = {
    pistacho: '#00E58D',    
    negro: '#1A1A1A',       
    fondo: '#F3F6FA',       
    blanco: '#FFFFFF',      
    azul: '#005AD6',       
    textoSuave: '#6E6E73',  
    error: '#FF3D71',       
    borde: '#dfdfe6',
    celeste: '#D9EBFF'      
};

export const Typography = {
    main: 'Inter-Regular' 
};


export const styles_app = StyleSheet.create({
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
        fontFamily: Typography.main, 
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
    
    card: {
        backgroundColor: Colors.blanco,
        borderRadius: 20,
        padding: 16,
        marginBottom: 12,
        shadowColor: Colors.negro,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 8,
        elevation: 2,
        borderWidth: 1,
        borderColor: Colors.borde
    },
    sectionTitle: {
        fontSize: 20,
        fontFamily: Typography.main,
        fontWeight: '700',
        color: Colors.negro,
        marginBottom: 16,
        marginTop: 10,
    },

    rowBetween: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 12
    },
    
    // botones principales
    buttonText: { 
        color: Colors.blanco, 
        fontFamily: Typography.main,
        fontWeight: '700', 
        fontSize: 16 
    },
    button: { 
        backgroundColor: Colors.azul, 
        height: 56, 
        borderRadius: 16, 
        justifyContent: 'center', 
        alignItems: 'center',
        marginTop: 8
    },

    // formularios
    input: { 
        backgroundColor: Colors.fondo, 
        height: 56, 
        borderRadius: 16, 
        borderWidth: 1,
        borderColor: Colors.borde,
        paddingHorizontal: 16, 
        fontSize: 16, 
        fontFamily: Typography.main, 
        color: Colors.negro,
        marginBottom: 12 
    },
    label: {
        fontSize: 14,
        fontFamily: Typography.main,
        color: Colors.textoSuave,
        marginBottom: 8,
        fontWeight: '600',
    }
});

export const Shadows = {
    suave: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    }
};