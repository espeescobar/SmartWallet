import { StyleSheet, Platform } from 'react-native';
import { Colors, Typography } from './App.styles';

export const styles = StyleSheet.create({
  avatarCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: Colors.celeste,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: Colors.azul,
    overflow: 'hidden',
  },
  avatarImage: {
    width: 44,
    height: 44,
    borderRadius: 22,
  },
  avatarInitials: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.azul,
    fontFamily: Typography.main,
  },
  menuOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.35)',
    justifyContent: 'flex-start',
    alignItems: 'flex-end',
    paddingTop: Platform.OS === 'ios' ? 100 : 60,
    paddingRight: 15,
  },
  menuContainer: {
    backgroundColor: Colors.blanco,
    borderRadius: 16,
    paddingVertical: 8,
    minWidth: 220,
    shadowColor: Colors.negro,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 8,
    borderWidth: 1,
    borderColor: Colors.borde,
  },
  menuItem: {
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  menuItemDanger: {
    borderTopWidth: 1,
    borderTopColor: Colors.borde,
  },
  menuItemText: {
    fontSize: 15,
    fontFamily: Typography.main,
    fontWeight: '600',
    color: Colors.negro,
  },
});
