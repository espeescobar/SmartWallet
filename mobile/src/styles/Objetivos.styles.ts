import { StyleSheet } from 'react-native';
export const styles = StyleSheet.create({
    card: { backgroundColor: '#FFFFFF', padding: 20, borderRadius: 24, marginBottom: 20, elevation: 2 },
    header: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 12 },
    title: { fontSize: 16, fontWeight: '700', color: '#1A1A1A' },
    percentage: { fontSize: 16, fontWeight: '700' },
    progressBg: { height: 8, backgroundColor: '#F0F0F2', borderRadius: 4, marginBottom: 8 },
    progressFill: { height: '100%', borderRadius: 4 },
    footer: { flexDirection: 'row', justifyContent: 'space-between' },
    amountText: { fontSize: 13, color: '#6E6E73' }
});