// apps/mobile/src/components/analytics/AnalyticsChart.tsx
import React, { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
} from "react-native";
import Svg, {
  Path,
  Defs,
  LinearGradient,
  Stop,
  Circle,
  Line,
} from "react-native-svg";
import { Card } from "../common/Card";
import { Colors } from "../../constants/theme";
import { SalesBucket } from "../../types";

const { width: SCREEN_WIDTH } = Dimensions.get("window");
const CHART_WIDTH = SCREEN_WIDTH - 72; // Card padding & screen margins
const CHART_HEIGHT = 160;

interface AnalyticsChartProps {
  data: SalesBucket[];
  currencySymbol?: string;
}

type ChartMetric = "revenue" | "orders";

export const AnalyticsChart: React.FC<AnalyticsChartProps> = ({
  data,
  currencySymbol = "₹",
}) => {
  const [metric, setMetric] = useState<ChartMetric>("revenue");
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);

  if (!data || data.length === 0) {
    return null;
  }

  // Extract values based on active metric
  const values = data.map((d) => (metric === "revenue" ? d.revenue : d.orders));
  const maxValue = Math.max(...values, metric === "revenue" ? 100 : 5);
  const minValue = 0;
  const range = maxValue - minValue || 1;

  // Calculate coordinates for SVG Path
  const points = data.map((item, index) => {
    const x = (index / (data.length - 1 || 1)) * CHART_WIDTH;
    const val = metric === "revenue" ? item.revenue : item.orders;
    const y = CHART_HEIGHT - ((val - minValue) / range) * (CHART_HEIGHT - 24) - 12;
    return { x, y, item, val };
  });

  // Construct SVG smooth/straight line path
  let pathD = `M ${points[0].x} ${points[0].y}`;
  for (let i = 1; i < points.length; i++) {
    const prev = points[i - 1];
    const curr = points[i];
    // Bezier control points for smooth curves
    const cx1 = prev.x + (curr.x - prev.x) / 2;
    const cy1 = prev.y;
    const cx2 = prev.x + (curr.x - prev.x) / 2;
    const cy2 = curr.y;
    pathD += ` C ${cx1} ${cy1}, ${cx2} ${cy2}, ${curr.x} ${curr.y}`;
  }

  // Fill area path (closed down to bottom)
  const lastPoint = points[points.length - 1];
  const areaD = `${pathD} L ${lastPoint.x} ${CHART_HEIGHT} L ${points[0].x} ${CHART_HEIGHT} Z`;

  const totalRevenue = data.reduce((sum, d) => sum + d.revenue, 0);
  const totalOrders = data.reduce((sum, d) => sum + d.orders, 0);

  const activePoint =
    selectedIndex !== null && points[selectedIndex]
      ? points[selectedIndex]
      : points[points.length - 1];

  return (
    <Card style={styles.card}>
      {/* Header with Switcher */}
      <View style={styles.header}>
        <View>
          <Text style={styles.subtitle}>Performance Over Time</Text>
          <Text style={styles.highlightValue}>
            {metric === "revenue"
              ? `${currencySymbol}${totalRevenue.toLocaleString("en-IN")}`
              : `${totalOrders} orders`}
          </Text>
        </View>

        {/* Metric Selector Pills */}
        <View style={styles.metricPills}>
          <TouchableOpacity
            activeOpacity={0.7}
            onPress={() => {
              setMetric("revenue");
              setSelectedIndex(null);
            }}
            style={[
              styles.pillBtn,
              metric === "revenue" && styles.pillBtnActive,
            ]}
          >
            <Text
              style={[
                styles.pillText,
                metric === "revenue" && styles.pillTextActive,
              ]}
            >
              Revenue
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            activeOpacity={0.7}
            onPress={() => {
              setMetric("orders");
              setSelectedIndex(null);
            }}
            style={[
              styles.pillBtn,
              metric === "orders" && styles.pillBtnActive,
            ]}
          >
            <Text
              style={[
                styles.pillText,
                metric === "orders" && styles.pillTextActive,
              ]}
            >
              Orders
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Selected Data Point Tooltip */}
      {activePoint && (
        <View style={styles.tooltipRow}>
          <Text style={styles.tooltipDate}>{activePoint.item.date}:</Text>
          <Text style={styles.tooltipVal}>
            {metric === "revenue"
              ? `${currencySymbol}${activePoint.item.revenue.toLocaleString("en-IN")}`
              : `${activePoint.item.orders} orders`}
          </Text>
        </View>
      )}

      {/* SVG Line & Area Chart */}
      <View style={styles.chartContainer}>
        <Svg width={CHART_WIDTH} height={CHART_HEIGHT}>
          <Defs>
            <LinearGradient id="chartGradient" x1="0" y1="0" x2="0" y2="1">
              <Stop
                offset="0%"
                stopColor={metric === "revenue" ? Colors.primary : Colors.info}
                stopOpacity="0.4"
              />
              <Stop
                offset="100%"
                stopColor={metric === "revenue" ? Colors.primary : Colors.info}
                stopOpacity="0.0"
              />
            </LinearGradient>
          </Defs>

          {/* Grid lines */}
          <Line
            x1="0"
            y1={CHART_HEIGHT / 2}
            x2={CHART_WIDTH}
            y2={CHART_HEIGHT / 2}
            stroke={Colors.border}
            strokeDasharray="4 4"
            strokeWidth="1"
          />
          <Line
            x1="0"
            y1={CHART_HEIGHT - 1}
            x2={CHART_WIDTH}
            y2={CHART_HEIGHT - 1}
            stroke={Colors.border}
            strokeWidth="1"
          />

          {/* Area under curve */}
          <Path d={areaD} fill="url(#chartGradient)" />

          {/* Stroke Line */}
          <Path
            d={pathD}
            fill="none"
            stroke={metric === "revenue" ? Colors.primaryText : Colors.info}
            strokeWidth="2.5"
          />

          {/* Points / Dots */}
          {points.map((pt, idx) => (
            <Circle
              key={idx}
              cx={pt.x}
              cy={pt.y}
              r={selectedIndex === idx ? 5 : 3}
              fill={Colors.background}
              stroke={metric === "revenue" ? Colors.primaryText : Colors.info}
              strokeWidth={selectedIndex === idx ? 3 : 1.5}
              onPress={() => setSelectedIndex(idx)}
            />
          ))}
        </Svg>
      </View>

      {/* X-Axis Date Labels */}
      <View style={styles.xAxisRow}>
        <Text style={styles.axisLabel}>{data[0]?.date || ""}</Text>
        {data.length > 2 && (
          <Text style={styles.axisLabel}>
            {data[Math.floor(data.length / 2)]?.date || ""}
          </Text>
        )}
        <Text style={styles.axisLabel}>
          {data[data.length - 1]?.date || ""}
        </Text>
      </View>
    </Card>
  );
};

const styles = StyleSheet.create({
  card: {
    padding: 16,
    marginBottom: 16,
    backgroundColor: Colors.surface,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 11,
    fontWeight: "600",
    color: Colors.textMuted,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  highlightValue: {
    fontSize: 20,
    fontWeight: "800",
    color: Colors.textPrimary,
    marginTop: 2,
  },
  metricPills: {
    flexDirection: "row",
    backgroundColor: Colors.surfaceMuted,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: Colors.border,
    padding: 2,
    gap: 2,
  },
  pillBtn: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 6,
  },
  pillBtnActive: {
    backgroundColor: Colors.primary,
  },
  pillText: {
    fontSize: 11,
    fontWeight: "600",
    color: Colors.textSecondary,
  },
  pillTextActive: {
    color: Colors.white,
    fontWeight: "700",
  },
  tooltipRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: Colors.surfaceMuted,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
    alignSelf: "flex-start",
    marginBottom: 10,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  tooltipDate: {
    fontSize: 11,
    color: Colors.textSecondary,
    fontWeight: "500",
  },
  tooltipVal: {
    fontSize: 11,
    color: Colors.primaryText,
    fontWeight: "700",
  },
  chartContainer: {
    alignItems: "center",
    justifyContent: "center",
    marginVertical: 4,
  },
  xAxisRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingHorizontal: 4,
    marginTop: 6,
  },
  axisLabel: {
    fontSize: 10,
    color: Colors.textMuted,
    fontWeight: "500",
  },
});

