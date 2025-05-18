import { Feather, Ionicons } from '@expo/vector-icons';
import { useNavigation } from 'expo-router';
import moment from 'moment';
import { useCallback, useEffect, useRef, useState } from 'react';
import { FlatList, Image, Modal, Platform, Pressable, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';

const API_URL = 'https://qa.corider.in/assignment/chat?page=';

const formatDate = (dateStr) => {
  return moment(dateStr).format('D MMM, YYYY').toUpperCase();
};

export default function ChatScreen() {
  const navigation = useNavigation();
  const [messages, setMessages] = useState([]);
  const [page, setPage] = useState(0);
  const [loading, setLoading] = useState(false);
  const [menuVisible, setMenuVisible] = useState(false);
  const [showAttachments, setShowAttachments] = useState(false);
  const flatListRef = useRef(null);

  const fetchMessages = useCallback(async (pageNum) => {
    if (loading) return;
    setLoading(true);
    try {
      const res = await fetch(API_URL + pageNum);
      const json = await res.json();
      const newMessages = json.chats || [];
      setMessages((prev) => [...newMessages.reverse(), ...prev]);
      setPage(pageNum + 1);
    } catch (err) {
      console.error('Failed to load messages:', err);
    }
    setLoading(false);
  }, [loading]);

  useEffect(() => {
    fetchMessages(0);
  }, [fetchMessages]);

  const handleScroll = (e) => {
    if (e.nativeEvent.contentOffset.y < 50 && !loading) {
      fetchMessages(page);
    }
  };

  const renderMessage = ({ item, index }) => {
    const isMe = item.sender.self;
    const messageDate = formatDate(item.timestamp);
    const nextItem = messages[index + 1];
    const nextDate = nextItem ? formatDate(nextItem.timestamp) : null;
    const showDateHeader = messageDate !== nextDate;

    return (
      <>
        {showDateHeader && (
          <View style={styles.dateHeaderContainer}>
            <Text style={styles.dateHeaderText}>{messageDate}</Text>
          </View>
        )}
        <View style={[styles.bubbleContainer, isMe ? styles.bubbleRight : styles.bubbleLeft]}>
          {!isMe && <Image source={{ uri: item.sender.image }} style={styles.avatar} />}
          <View style={[styles.bubble, isMe ? styles.bubbleBlue : styles.bubbleGray]}>
            <Text style={[styles.messageText, !isMe && { color: '#000' }]}>{item.message}</Text>
          </View>
        </View>
      </>
    );
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color="black" />
        </TouchableOpacity>
        <View style={styles.headerInfo}>
          <Text style={styles.tripTitle}>Trip 1</Text>
          <Text style={styles.tripSubtitle}>
            From <Text style={styles.bold}>IGI Airport, T3</Text>{'\n'}To <Text style={styles.bold}>Sector 28</Text>
          </Text>
          <View style={styles.avatars}>
            <Image source={{ uri: 'https://randomuser.me/api/portraits/women/1.jpg' }} style={styles.avatarMini} />
            <Image source={{ uri: 'https://randomuser.me/api/portraits/men/2.jpg' }} style={styles.avatarMini} />
          </View>
        </View>

        <TouchableOpacity style={{ marginRight: 12 }}>
          <Feather name="edit" size={22} color="black" />
        </TouchableOpacity>

        <TouchableOpacity onPress={() => setMenuVisible(true)}>
          <Feather name="more-vertical" size={24} color="black" />
        </TouchableOpacity>
      </View>

      {/* Dropdown Menu */}
      <Modal visible={menuVisible} transparent animationType="fade">
        <Pressable style={styles.modalOverlay} onPress={() => setMenuVisible(false)}>
          <View style={styles.menu}>
          <TouchableOpacity>
            <Text style={styles.menuItem}>👥 Members</Text>
          </TouchableOpacity>
          <TouchableOpacity>
            <Text style={styles.menuItem}>📞 Share Number</Text>
          </TouchableOpacity>
          <TouchableOpacity>
            <Text style={styles.menuItem}>🚩 Report</Text>
          </TouchableOpacity>
          </View>
        </Pressable>
      </Modal>

      {/* Messages */}
      <FlatList
        ref={flatListRef}
        data={[...messages].reverse()}
        renderItem={renderMessage}
        keyExtractor={(item, index) => item.id?.toString() + index}
        contentContainerStyle={{ padding: 12 }}
        inverted
        onScroll={handleScroll}
      />

      {/* Input */}
      <View style={styles.inputBar}>
        <TextInput
          style={styles.input}
          placeholder="Reply to @Rohit Yadav"
          placeholderTextColor="#aaa"
        />
        <View style={{ position: 'relative' }}>
          <TouchableOpacity onPress={() => setShowAttachments(!showAttachments)} style={styles.clipButton}>
            <Feather name="paperclip" size={24} color="black" />
          </TouchableOpacity>

          {showAttachments && (
            <View style={styles.attachmentPopup}>
              <TouchableOpacity>
                <Feather name="camera" size={24} color="white" />
              </TouchableOpacity>
              <TouchableOpacity>
                <Feather name="video" size={24} color="white" />
              </TouchableOpacity>
              <TouchableOpacity>
                <Ionicons name="document" size={24} color="white" />
              </TouchableOpacity>
            </View>
          )}
        </View>
        <TouchableOpacity>
          <Ionicons name="send" size={24} color="black" />
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  header: {
    flexDirection: 'row',
    padding: 12,
    paddingVertical:50,
    alignItems: 'center',
    borderBottomWidth: 1,
    borderColor: '#eee',
  },
  headerInfo: { flex: 1, marginLeft: 12 },
  tripTitle: { fontWeight: '600', fontSize: 16 },
  tripSubtitle: { fontSize: 12, color: '#555', marginTop: 4 },
  bold: { fontWeight: '700' },
  avatars: { flexDirection: 'row', marginTop: 4 },
  avatarMini: { width: 24, height: 24, borderRadius: 12, marginRight: 4 },
  modalOverlay: {
    flex: 1,
    backgroundColor: '#00000040',
    justifyContent: 'flex-start',
    alignItems: 'flex-end',
    paddingTop: Platform.OS === 'android' ? 32 : 64,
    paddingRight: 16,
  },
  menu: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 8,
    width: 160,
    elevation: 5,
  },
  menuItem: { padding: 10, fontSize: 14, borderBottomWidth: 0.5, borderColor: '#eee' },
  dateHeaderContainer: {
    alignItems: 'center',
    marginVertical: 12,
  },
  dateHeaderText: {
    fontSize: 12,
    color: '#777',
    backgroundColor: '#e0e0e0',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  bubbleContainer: { flexDirection: 'row', alignItems: 'flex-end', marginVertical: 6 },
  bubbleLeft: { alignSelf: 'flex-start' },
  bubbleRight: { alignSelf: 'flex-end', flexDirection: 'row-reverse' },
  bubble: {
    maxWidth: '75%',
    padding: 10,
    marginHorizontal: 6,
  },
  bubbleBlue: {
    backgroundColor: '#007AFF',
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    borderBottomLeftRadius: 16,
    borderBottomRightRadius: 4,
  },
  bubbleGray: {
    backgroundColor: '#f1f1f1',
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    borderBottomRightRadius: 16,
    borderBottomLeftRadius: 4,
  },
  messageText: { color: '#fff' },
  avatar: { width: 28, height: 28, borderRadius: 14, marginRight: 6 },
  inputBar: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
    borderTopWidth: 1,
    borderColor: '#eee',
    backgroundColor: '#f8f8f8',
  },
  input: {
    flex: 1,
    marginHorizontal: 10,
    paddingVertical: 6,
    paddingHorizontal: 12,
    backgroundColor: '#fff',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#ccc',
  },
  clipButton: {
    padding: 10,
    borderRadius: 20,
    marginRight: 8,
  },
  attachmentPopup: {
    position: 'absolute',
    bottom: 55,
    backgroundColor: 'green',
    borderRadius: 24,
    flexDirection: 'row',
    padding: 10,
    gap: 10,
    zIndex: 10,
    left:-40
  },
});
