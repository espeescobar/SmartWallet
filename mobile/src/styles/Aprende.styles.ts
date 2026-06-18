import { StyleSheet } from 'react-native';
import { Colors, Typography } from './App.styles';

export const styles = StyleSheet.create({
  termCard: {
    backgroundColor: Colors.blanco,
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: Colors.borde,
  },
  termTitle: {
    fontSize: 17,
    fontFamily: Typography.main,
    fontWeight: '700',
    color: Colors.negro,
    marginBottom: 6,
  },
  termCategory: {
    fontSize: 12,
    fontFamily: Typography.main,
    color: Colors.azul,
    fontWeight: '600',
    marginBottom: 8,
  },
  termDefinition: {
    fontSize: 15,
    fontFamily: Typography.main,
    color: Colors.textoSuave,
    lineHeight: 22,
  },
  offlineBanner: {
    backgroundColor: Colors.celeste,
    borderRadius: 12,
    padding: 12,
    marginBottom: 16,
  },
  offlineText: {
    fontSize: 13,
    fontFamily: Typography.main,
    color: Colors.azul,
    textAlign: 'center',
  },
  bottomPadding: {
    height: 40,
  },
});
