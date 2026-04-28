import { StyleSheet } from 'react-native';
export const styles = StyleSheet.create({
    card: { backgroundColor: '#FFFFFF', padding: 20, borderRadius: 24, marginBottom: 30, elevation: 2 },
    input: { backgroundColor: '#F7F7F9', height: 56, borderRadius: 16, paddingHorizontal: 16, fontSize: 16, marginBottom: 12 },
    categorySelector: { backgroundColor: '#F7F7F9', height: 56, borderRadius: 16, paddingHorizontal: 16, justifyContent: 'center', marginBottom: 12 },
    categoryTextFilled: { fontSize: 16, color: '#1A1A1A' },
    categoryTextPlaceholder: { fontSize: 16, color: '#A1A1A8' },
    button: { backgroundColor: '#1A1A1A', height: 56, borderRadius: 16, justifyContent: 'center', alignItems: 'center' },
    buttonText: { color: '#FFFFFF', fontWeight: '700', fontSize: 16 },
    modalOverlay: { flex: 1, justifyContent: 'flex-end', backgroundColor: 'rgba(0,0,0,0.4)' },
    modalContent: { backgroundColor: '#FFFFFF', borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 24, maxHeight: '70%' },
    modalTitle: { fontSize: 20, fontWeight: '700', color: '#1A1A1A', marginBottom: 20, textAlign: 'center' },
    modalItem: { paddingVertical: 16, borderBottomWidth: 1, borderBottomColor: '#F0F0F2' },
    modalItemText: { fontSize: 18, color: '#1A1A1A' },
    modalCloseButton: { marginTop: 20, backgroundColor: '#F0F0F2', height: 56, borderRadius: 16, justifyContent: 'center', alignItems: 'center' },
    modalCloseText: { fontSize: 16, fontWeight: '700', color: '#1A1A1A' }
});