import React from "react";
import { StyleSheet, View } from "react-native";
import Svg, { Rect, Path, G, Circle as SvgCircle, Text as SvgText } from "react-native-svg";
import { GestureDetector, Gesture, GestureHandlerRootView } from "react-native-gesture-handler";
import Animated, { useSharedValue, useAnimatedStyle } from "react-native-reanimated";

type CircleStatus = "UNVISITED" | "COMPLETED" | "SOLD_OUT";

interface CircleData {
  id: string;
  space: string;
  status: CircleStatus;
  x: number; // SVG座標系 (0 ~ 1000)
  y: number; // SVG座標系 (0 ~ 1000)
}

interface Props {
  circles: CircleData[];
  selectedId: string | null;
  onSelectCircle: (id: string) => void;
}

export const InteractiveSvgMap: React.FC<Props> = ({
  circles,
  selectedId,
  onSelectCircle,
}) => {
  // 拡大・移動用のアニメーションSharedValue
  const scale = useSharedValue(1);
  const savedScale = useSharedValue(1);
  const translateX = useSharedValue(0);
  const translateY = useSharedValue(0);
  const savedTranslateX = useSharedValue(0);
  const savedTranslateY = useSharedValue(0);

  // ピンチズームジェスチャー
  const pinchGesture = Gesture.Pinch()
    .onUpdate((e) => {
      scale.value = Math.max(0.8, Math.min(savedScale.value * e.scale, 4));
    })
    .onEnd(() => {
      savedScale.value = scale.value;
    });

  // パン（ドラッグ移動）ジェスチャー
  const panGesture = Gesture.Pan()
    .onUpdate((e) => {
      translateX.value = savedTranslateX.value + e.translationX;
      translateY.value = savedTranslateY.value + e.translationY;
    })
    .onEnd(() => {
      savedTranslateX.value = translateX.value;
      savedTranslateY.value = translateY.value;
    });

  const composedGesture = Gesture.Simultaneous(pinchGesture, panGesture);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [
      { translateX: translateX.value },
      { translateY: translateY.value },
      { scale: scale.value },
    ],
  }));

  const getStatusColor = (status: CircleStatus) => {
    switch (status) {
      case "COMPLETED": return "#4CAF50";
      case "SOLD_OUT": return "#FFC107";
      default: return "#F44336";
    }
  };

  return (
    <GestureHandlerRootView style={styles.container}>
      <GestureDetector gesture={composedGesture}>
        <Animated.View style={[styles.mapWrapper, animatedStyle]}>
          <Svg viewBox="0 0 1000 1000" width="100%" height="100%">
            {/* --- 会場レイアウト（SVG背景） --- */}
            {/* ホール外郭 */}
            <Rect x="50" y="50" width="900" height="900" fill="#F8FAFC" stroke="#CBD5E1" strokeWidth="8" rx="16" />
            {/* ブロック島A */}
            <Rect x="100" y="150" width="350" height="300" fill="#E2E8F0" rx="8" />
            <SvgText x="120" y="190" fontSize="24" fontWeight="bold" fill="#64748B">東1ホール - Aブロック</SvgText>
            {/* ブロック島B */}
            <Rect x="550" y="150" width="350" height="300" fill="#E2E8F0" rx="8" />
            <SvgText x="570" y="190" fontSize="24" fontWeight="bold" fill="#64748B">東1ホール - Bブロック</SvgText>
            {/* 通路 */}
            <Path d="M 50 500 L 950 500" stroke="#94A3B8" strokeWidth="12" strokeDasharray="20,10" />

            {/* --- サークルピンをSVG要素としてOverlay --- */}
            {circles.map((circle) => {
              const isSelected = selectedId === circle.id;
              const color = getStatusColor(circle.status);

              return (
                <G
                  key={circle.id}
                  onPress={() => onSelectCircle(circle.id)}
                  transform={`translate(${circle.x}, ${circle.y})`}
                >
                  {/* ピンの外枠（選択状態強調） */}
                  {isSelected && (
                    <SvgCircle r="32" fill="none" stroke="#2196F3" strokeWidth="6" />
                  )}
                  {/* ピン本体 */}
                  <SvgCircle r="24" fill={color} stroke="#FFF" strokeWidth="4" />
                  {/* サークル配置文字 */}
                  <SvgText
                    y="6"
                    fontSize="14"
                    fontWeight="bold"
                    fill="#FFF"
                    textAnchor="middle"
                  >
                    {circle.space.replace("東", "")}
                  </SvgText>
                </G>
              );
            })}
          </Svg>
        </Animated.View>
      </GestureDetector>
    </GestureHandlerRootView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#0F172A", borderRadius: 12, overflow: "hidden" },
  mapWrapper: { width: "100%", height: "100%" },
});
