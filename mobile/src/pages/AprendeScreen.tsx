import React, { useState, useEffect } from 'react';
import { ScrollView, Text, SafeAreaView, ActivityIndicator, View } from 'react-native';
import { styles_app } from '../styles/App.styles';
import { styles } from '../styles/Aprende.styles';
import { GLOSARIO_LOCAL, TerminoFinanciero } from '../data/glosario';
import { api } from '../services/api';

export default function AprendeScreen() {
  const [terminos, setTerminos] = useState<TerminoFinanciero[]>(GLOSARIO_LOCAL);
  const [loading, setLoading] = useState(true);
  const [usandoCache, setUsandoCache] = useState(false);

  useEffect(() => {
    api.get('/financial-tips')
      .then((res) => {
        if (Array.isArray(res.data) && res.data.length > 0) {
          setTerminos(res.data);
        }
      })
      .catch(() => {
        setUsandoCache(true);
        setTerminos(GLOSARIO_LOCAL);
      })
      .finally(() => setLoading(false));
  }, []);

  return (
    <SafeAreaView style={styles_app.safeArea}>
      <ScrollView style={styles_app.container} showsVerticalScrollIndicator={false}>
        <Text style={styles_app.screenTitle}>Aprende</Text>
        <Text style={styles_app.subtitle}>Conceptos financieros explicados de forma sencilla</Text>

        {usandoCache && (
          <View style={styles.offlineBanner}>
            <Text style={styles.offlineText}>
              Mostrando contenido guardado localmente
            </Text>
          </View>
        )}

        {loading
          ? <ActivityIndicator style={{ marginTop: 20 }} />
          : terminos.map((t) => (
            <View key={t.id} style={styles.termCard}>
              <Text style={styles.termCategory}>{t.categoria}</Text>
              <Text style={styles.termTitle}>{t.termino}</Text>
              <Text style={styles.termDefinition}>{t.definicion}</Text>
            </View>
          ))
        }

        <View style={styles.bottomPadding} />
      </ScrollView>
    </SafeAreaView>
  );
}
