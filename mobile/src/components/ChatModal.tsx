import React, { useEffect, useRef, useState, useCallback } from 'react';
import {
  Modal,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
} from 'react-native';
import { chatApi, ChatMessage } from '../services/chatApi';
import { Colors, Typography } from '../styles/App.styles';

interface Props {
  visible: boolean;
  onClose: () => void;
}

const isWeb = Platform.OS === 'web';

const WELCOME: ChatMessage = {
  id: 'welcome',
  session_id: '',
  role: 'assistant',
  content:
    '¡Hola! Soy Wally 🦊, tu asistente financiero. Pregúntame sobre ahorro, presupuesto o tus gastos del mes.',
  tokens_used: null,
  created_at: new Date().toISOString(),
};

export default function ChatModal({ visible, onClose }: Props) {
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([WELCOME]);
  const [input, setInput] = useState('');
  const [sending, setSending] = useState(false);
  const [loading, setLoading] = useState(false);
  const listRef = useRef<FlatList>(null);
  const sessionIdRef = useRef<string | null>(null);
  const initializedRef = useRef(false);

  // Al abrir por primera vez: asegura una sesión y carga el historial.
  // OJO: el efecto depende solo de `visible`; usamos refs para no re-disparar
  // el efecto al setear el sessionId (eso causaba que el loading quedara pegado).
  useEffect(() => {
    if (!visible || initializedRef.current) return;
    initializedRef.current = true;
    let cancelled = false;

    (async () => {
      setLoading(true);
      try {
        const sessions = await chatApi.getSessions();
        const session = sessions[0] ?? (await chatApi.createSession());
        if (cancelled) return;
        sessionIdRef.current = session.id;
        setSessionId(session.id);

        const history = await chatApi.getMessages(session.id);
        if (cancelled) return;
        if (history.length > 0) setMessages(history);
      } catch {
        // Si falla, dejamos el mensaje de bienvenida y se reintenta al enviar.
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [visible]);

  const scrollToEnd = useCallback(() => {
    setTimeout(() => listRef.current?.scrollToEnd({ animated: true }), 80);
  }, []);

  const handleSend = useCallback(async () => {
    const text = input.trim();
    if (!text || sending) return;

    setInput('');
    setSending(true);

    let sid = sessionIdRef.current;
    try {
      // Asegura sesión por si la carga inicial falló
      if (!sid) {
        const session = await chatApi.createSession();
        sid = session.id;
        sessionIdRef.current = sid;
        setSessionId(sid);
      }

      const optimistic: ChatMessage = {
        id: `tmp-${Date.now()}`,
        session_id: sid,
        role: 'user',
        content: text,
        tokens_used: null,
        created_at: new Date().toISOString(),
      };
      setMessages((prev) => [...prev, optimistic]);
      scrollToEnd();

      const reply = await chatApi.sendMessage(sid, text);
      setMessages((prev) => [...prev, reply]);
      scrollToEnd();
    } catch {
      setMessages((prev) => [
        ...prev,
        {
          id: `err-${Date.now()}`,
          session_id: sid ?? '',
          role: 'assistant',
          content: 'No pude enviar tu mensaje. Revisa tu conexión e intenta de nuevo.',
          tokens_used: null,
          created_at: new Date().toISOString(),
        },
      ]);
    } finally {
      setSending(false);
    }
  }, [input, sending, scrollToEnd]);

  const renderItem = ({ item }: { item: ChatMessage }) => {
    const isUser = item.role === 'user';
    return (
      <View style={[styles.bubbleRow, isUser ? styles.rowRight : styles.rowLeft]}>
        <View style={[styles.bubble, isUser ? styles.bubbleUser : styles.bubbleBot]}>
          <Text style={[styles.bubbleText, isUser && styles.bubbleTextUser]}>
            {item.content}
          </Text>
        </View>
      </View>
    );
  };

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
      <View style={styles.overlay}>
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          style={styles.sheet}
        >
          {/* Header */}
          <View style={styles.header}>
            <View>
              <Text style={styles.headerTitle}>Wally 🦊</Text>
              <Text style={styles.headerSubtitle}>Tu asistente financiero</Text>
            </View>
            <TouchableOpacity onPress={onClose} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
              <Text style={styles.close}>✕</Text>
            </TouchableOpacity>
          </View>

          {/* Mensajes */}
          <View style={styles.body}>
            <FlatList
              ref={listRef}
              data={messages}
              keyExtractor={(m) => m.id}
              renderItem={renderItem}
              style={styles.list}
              contentContainerStyle={styles.listContent}
              onContentSizeChange={scrollToEnd}
            />
            {loading && (
              <View style={styles.loadingOverlay}>
                <ActivityIndicator color={Colors.azul} />
              </View>
            )}
          </View>

          {sending && <Text style={styles.typing}>Wally está escribiendo…</Text>}

          {/* Input */}
          <View style={styles.inputRow}>
            <TextInput
              style={styles.input}
              value={input}
              onChangeText={setInput}
              placeholder="Escribe tu pregunta…"
              placeholderTextColor={Colors.textoSuave}
              multiline
              onSubmitEditing={handleSend}
              blurOnSubmit={!isWeb}
              returnKeyType="send"
            />
            <TouchableOpacity
              style={[styles.sendBtn, (!input.trim() || sending) && styles.sendBtnDisabled]}
              onPress={handleSend}
              disabled={!input.trim() || sending}
            >
              <Text style={styles.sendBtnText}>➤</Text>
            </TouchableOpacity>
          </View>
        </KeyboardAvoidingView>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: isWeb ? 'center' : 'flex-end',
    alignItems: isWeb ? 'center' : 'stretch',
    padding: isWeb ? 24 : 0,
  },
  sheet: {
    width: '100%',
    maxWidth: isWeb ? 420 : undefined,
    height: isWeb ? undefined : '85%',
    maxHeight: isWeb ? 640 : undefined,
    flex: isWeb ? 1 : undefined,
    backgroundColor: Colors.fondo,
    borderRadius: isWeb ? 20 : 0,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    overflow: 'hidden',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: Colors.blanco,
    borderBottomWidth: 1,
    borderBottomColor: Colors.borde,
  },
  headerTitle: { fontSize: 18, fontWeight: '800', color: Colors.negro, fontFamily: Typography.main },
  headerSubtitle: { fontSize: 13, color: Colors.textoSuave, fontFamily: Typography.main },
  close: { fontSize: 18, color: Colors.textoSuave, fontWeight: '700' },
  body: { flex: 1 },
  list: { flex: 1 },
  loadingOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
  },
  listContent: { padding: 16, paddingBottom: 8 },
  bubbleRow: { marginBottom: 10, flexDirection: 'row' },
  rowLeft: { justifyContent: 'flex-start' },
  rowRight: { justifyContent: 'flex-end' },
  bubble: { maxWidth: '80%', borderRadius: 18, paddingHorizontal: 14, paddingVertical: 10 },
  bubbleBot: {
    backgroundColor: Colors.blanco,
    borderWidth: 1,
    borderColor: Colors.borde,
    borderTopLeftRadius: 4,
  },
  bubbleUser: { backgroundColor: Colors.azul, borderTopRightRadius: 4 },
  bubbleText: { fontSize: 15, color: Colors.negro, fontFamily: Typography.main, lineHeight: 21 },
  bubbleTextUser: { color: Colors.blanco },
  typing: {
    paddingHorizontal: 20,
    paddingBottom: 6,
    color: Colors.textoSuave,
    fontStyle: 'italic',
    fontFamily: Typography.main,
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    padding: 12,
    backgroundColor: Colors.blanco,
    borderTopWidth: 1,
    borderTopColor: Colors.borde,
  },
  input: {
    flex: 1,
    maxHeight: 110,
    minHeight: 44,
    backgroundColor: Colors.fondo,
    borderRadius: 22,
    borderWidth: 1,
    borderColor: Colors.borde,
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 12,
    fontSize: 15,
    fontFamily: Typography.main,
    color: Colors.negro,
  },
  sendBtn: {
    marginLeft: 8,
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: Colors.azul,
    justifyContent: 'center',
    alignItems: 'center',
  },
  sendBtnDisabled: { backgroundColor: Colors.borde },
  sendBtnText: { color: Colors.blanco, fontSize: 18, fontWeight: '700' },
});
