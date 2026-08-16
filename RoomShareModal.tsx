import React, { useState } from "react";
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Button,
} from "react-native";
import QRCode from "react-native-qrcode-svg";
import { CameraView, useCameraPermissions } from "expo-camera";

interface Props {
  visible: boolean;
  roomId: string;
  onClose: () => void;
  onJoinRoom: (newRoomId: string) => void;
}

export const RoomShareModal: React.FC<Props> = ({
  visible,
  roomId,
  onClose,
  onJoinRoom,
}) => {
  const [mode, setMode] = useState<"SHOW_QR" | "SCAN_QR">("SHOW_QR");
  const [permission, requestPermission] = useCameraPermissions();
  const [scanned, setScanned] = useState(false);

  // QRコード検出時
  const handleBarcodeScanned = ({ data }: { data: string }) => {
    if (scanned) return;
    setScanned(true);

    // URIプロトコル解釈 (例: comiketmap://room/c108_room_alpha)
    if (data.startsWith("comiketmap://room/")) {
      const extractedRoomId = data.replace("comiketmap://room/", "");
      onJoinRoom(extractedRoomId);
      onClose();
    } else {
      alert("無効なルームQRコードです");
    }
    setTimeout(() => setScanned(false), 2000);
  };

  return (
    <Modal visible={visible} animationType="slide" transparent={false}>
      <View style={styles.container}>
        {/* モード切替タブ */}
        <View style={styles.tabContainer}>
          <TouchableOpacity
            style={[styles.tab, mode === "SHOW_QR" && styles.activeTab]}
            onPress={() => setMode("SHOW_QR")}
          >
            <Text style={styles.tabText}>自分のQRを表示</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.tab, mode === "SCAN_QR" && styles.activeTab]}
            onPress={() => setMode("SCAN_QR")}
          >
            <Text style={styles.tabText}>QRをスキャン</Text>
          </TouchableOpacity>
        </View>

        {/* 1. QRコード表示エリア */}
        {mode === "SHOW_QR" ? (
          <View style={styles.content}>
            <Text style={styles.title}>仲間を招待する</Text>
            <Text style={styles.subtitle}>ROOM ID: {roomId}</Text>
            <View style={styles.qrWrapper}>
              <QRCode
                value={`comiketmap://room/${roomId}`}
                size={220}
                color="#000"
                backgroundColor="#FFF"
              />
            </View>
            <Text style={styles.hint}>
              相手のアプリでこのQRコードを読み取ると、リアルタイム同期に参加できます。
            </Text>
          </View>
        ) : (
          /* 2. QRスキャンエリア */
          <View style={styles.content}>
            {!permission?.granted ? (
              <View style={styles.permissionContainer}>
                <Text style={styles.hint}>カメラの権限が必要です</Text>
                <Button title="権限を許可" onPress={requestPermission} />
              </View>
            ) : (
              <View style={styles.cameraContainer}>
                <CameraView
                  style={StyleSheet.absoluteFillObject}
                  barcodeScannerSettings={{ barcodeTypes: ["qr"] }}
                  onBarcodeScanned={handleBarcodeScanned}
                />
              </View>
            )}
          </View>
        )}

        <TouchableOpacity style={styles.closeButton} onPress={onClose}>
          <Text style={styles.closeButtonText}>閉じる</Text>
        </TouchableOpacity>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#FFF", paddingTop: 50 },
  tabContainer: { flexDirection: "row", borderBottomWidth: 1, borderColor: "#E2E8F0" },
  tab: { flex: 1, paddingVertical: 14, alignItems: "center" },
  activeTab: { borderBottomWidth: 3, borderColor: "#2196F3" },
  tabText: { fontWeight: "bold", fontSize: 14 },
  content: { flex: 1, alignItems: "center", justifyContent: "center", padding: 24 },
  title: { fontSize: 20, fontWeight: "bold", marginBottom: 8 },
  subtitle: { fontSize: 14, color: "#64748B", marginBottom: 24 },
  qrWrapper: { padding: 16, backgroundColor: "#FFF", borderRadius: 12, elevation: 4 },
  hint: { marginTop: 24, textAlign: "center", color: "#64748B", fontSize: 12 },
  cameraContainer: { width: 280, height: 280, borderRadius: 16, overflow: "hidden" },
  permissionContainer: { alignItems: "center", gap: 12 },
  closeButton: { padding: 16, alignItems: "center", backgroundColor: "#F1F5F9" },
  closeButtonText: { fontWeight: "bold", color: "#334155" },
});