import { StyleSheet } from 'react-native';
import { Colors, Typography } from './App.styles';

export const styles = StyleSheet.create({
  filterRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 20,
  },
  filterChip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: Colors.fondo,
    borderWidth: 1,
    borderColor: Colors.borde,
  },
  filterChipActive: {
    backgroundColor: Colors.celeste,
    borderColor: Colors.azul,
  },
  filterText: {
    fontSize: 13,
    fontFamily: Typography.main,
    color: Colors.textoSuave,
    fontWeight: '600',
  },
  filterTextActive: {
    color: Colors.azul,
  },
  chartCard: {
    backgroundColor: Colors.fondo,
    borderRadius: 20,
    padding: 20,
    marginBottom: 20,
    alignItems: 'center',
  },
  chartTitle: {
    fontSize: 16,
    fontFamily: Typography.main,
    fontWeight: '700',
    color: Colors.negro,
    marginBottom: 16,
    alignSelf: 'flex-start',
  },
  legendRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
    width: '100%',
  },
  legendDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 8,
  },
  legendLabel: {
    flex: 1,
    fontSize: 14,
    fontFamily: Typography.main,
    color: Colors.negro,
  },
  legendValue: {
    fontSize: 14,
    fontFamily: Typography.main,
    fontWeight: '700',
    color: Colors.negro,
  },
  pieContainer: {
    width: 160,
    height: 160,
    borderRadius: 80,
    overflow: 'hidden',
    marginBottom: 16,
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  pieSegment: {
    position: 'absolute',
  },
  lineChartContainer: {
    width: '100%',
    height: 120,
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    paddingHorizontal: 4,
  },
  lineBar: {
    flex: 1,
    marginHorizontal: 2,
    borderTopLeftRadius: 4,
    borderTopRightRadius: 4,
    backgroundColor: Colors.azul,
    minHeight: 4,
  },
  lineLabel: {
    fontSize: 10,
    fontFamily: Typography.main,
    color: Colors.textoSuave,
    textAlign: 'center',
    marginTop: 4,
  },
  errorBanner: {
    backgroundColor: '#FFEBEE',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#FFCDD2',
  },
  errorBannerText: {
    color: Colors.error,
    fontFamily: Typography.main,
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 20,
  },
  emptyChart: {
    fontSize: 14,
    fontFamily: Typography.main,
    color: Colors.textoSuave,
    padding: 20,
    textAlign: 'center',
  },
  
});
