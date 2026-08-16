import React, { useEffect, useState } from "react";
import { StyleSheet, Text, View, TouchableOpacity, FlatList, SafeAreaView } from "react-native";
import { ref, onValue, update } from "firebase/database";
import { db } from "./firebase";
import { InteractiveSvgMap } from "./InteractiveSvgMap";
import { RoomShareModal } from "./RoomShareModal";

export default function App() {
  const [roomId, setRoomId] = useState("c108_room_alpha");
  const [circles, setCircles] = useState<any[]>([]);
  const [selectedCircleId, setSelectedCircleId] = useState<string | null>(null);
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);

  // ルーム変更時に自動同期を差し替え
  useEffect(() => {
    const roomRef = ref(db, `rooms/${roomId}/circles`);
    const unsubscribe = onValue(roomRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        setCircles(Object.keys(data).map((key) => ({ id: key, ...data[key] })));
      } else {
        // 初期データを座標指定付きで登録 (0 ~ 1000のSVG空間)
        update(roomRef, {
          c_01: { space: "東A-01a", name: "極東開発工房", status: "UNVISITED", x: 200, y: 300 },
          c_02: { space: "東A-02b", name: "コミケサンフランシスコ", status: "UNVISITED", x: 350, y: 300 },
          c_03: { space: "東B-10a", name: "ねこみみテクノロジー", status: "UNVISITED", x: 650, y: 300 },
          c_04: { space: "東B-12b", name: "オフラインラボ", status: "UNVISITED", x: 800, y: 300 },
        });
      }
    });
    return () => unsubscribe();
  }, [roomId]);

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#FFF" }}>
      {/* 上部ヘッダー & QR共有ボタン */}
      <View style={styles.header}>
        <View style={styles.row}>
          <Text style={styles.roomText}>ROOM: {roomId}</Text>
          <TouchableOpacity
            style={styles.shareButton}
            onPress={() => setIsShareModalOpen(true)}
          >
            <Text style={styles.shareButtonText}>QR共有・参加</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* SVG インタラクティブマップ */}
      <View style={{ height: 320, padding: 12 }}>
        <InteractiveSvgMap
          circles={circles}
          selectedId={selectedCircleId}
          onSelectCircle={(id) => setSelectedCircleId(id)}
        />
      </View>

      {/* リスト表示 */}
      <FlatList
        data={circles}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={[styles.card, selectedCircleId === item.id && styles.activeCard]}
            onPress={() => setSelectedCircleId(item.id)}
          >
            <Text style={styles.space}>{item.space}</Text>
            <Text style={styles.name}>{item.name}</Text>
          </TouchableOpacity>
        )}
      />

      {/* QRコード共有＆スキャンモーダル */}
      <RoomShareModal
        visible={isShareModalOpen}
        roomId={roomId}
        onClose={() => setIsShareModalOpen(false)}
        onJoinRoom={(newRoomId) => setRoomId(newRoomId)}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  header: { padding: 16, borderBottomWidth: 1, borderColor: "#E2E8F0" },
  row: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  roomText: { fontWeight: "bold", fontSize: 16, color: "#1E293B" },
  shareButton: { backgroundColor: "#2196F3", paddingHorizontal: 12, paddingVertical: 6, borderRadius: 6 },
  shareButtonText: { color: "#FFF", fontWeight: "bold", fontSize: 12 },
  card: { padding: 16, marginHorizontal: 16, marginBottom: 8, backgroundColor: "#F8FAFC", borderRadius: 8 },
  activeCard: { borderWidth: 2, borderColor: "#2196F3" },
  space: { color: "#EF4444", fontWeight: "bold" },
  name: { fontSize: 16, fontWeight: "500", marginTop: 2 },
});
