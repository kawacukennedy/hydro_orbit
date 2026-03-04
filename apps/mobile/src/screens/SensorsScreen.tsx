import React from 'react';
import { View, Text, StyleSheet, ScrollView, RefreshControl } from 'react-native';
import { useSensors } from '../hooks/useApi';
import { colors, spacing, layout } from '../theme/colors';
import { Network, Waves, TestTube, Gauge, Wifi, WifiOff } from 'lucide-react-native';
import { SensorType, SensorStatus } from '@hydro-orbit/shared-types';

export default function SensorsScreen() {
    const { data: sensors, isLoading, refetch } = useSensors();

    const getSensorIcon = (type: SensorType) => {
        switch (type) {
            case SensorType.MOISTURE: return <Waves color={colors.primary} size={24} />;
            case SensorType.PH: return <TestTube color={colors.primary} size={24} />;
            case SensorType.WATER_LEVEL: return <Gauge color={colors.primary} size={24} />;
            default: return <Waves color={colors.primary} size={24} />;
        }
    };

    return (
        <ScrollView
            style={styles.container}
            refreshControl={<RefreshControl refreshing={isLoading} onRefresh={refetch} />}
        >
            <View style={styles.header}>
                <View style={styles.headerIcon}>
                    <Network color={colors.primary} size={24} />
                </View>
                <Text style={styles.title}>Sensor Network</Text>
            </View>

            <View style={styles.list}>
                {sensors?.map((sensor) => (
                    <View key={sensor.id} style={styles.card}>
                        <View style={styles.cardHeader}>
                            <View style={[styles.iconContainer, sensor.status === SensorStatus.LOW_BATTERY && styles.iconContainerWarn]}>
                                {getSensorIcon(sensor.type)}
                            </View>
                            <View style={[styles.badge, sensor.status === SensorStatus.ONLINE ? styles.badgeSuccess : styles.badgeWarn]}>
                                <Text style={styles.badgeText}>{sensor.status}</Text>
                            </View>
                        </View>

                        <View style={styles.details}>
                            <View style={styles.detailRow}>
                                <Text style={styles.detailLabel}>ID</Text>
                                <Text style={styles.detailValue}>{sensor.id}</Text>
                            </View>
                            <View style={styles.detailRow}>
                                <Text style={styles.detailLabel}>Location</Text>
                                <Text style={styles.detailValue}>{sensor.zoneId || sensor.farmId}</Text>
                            </View>
                            <View style={styles.detailRow}>
                                <Text style={styles.detailLabel}>Type</Text>
                                <Text style={styles.detailValue}>
                                    {sensor.type.toLowerCase().replace('_', ' ')}
                                </Text>
                            </View>
                            <View style={styles.detailRow}>
                                <Text style={styles.detailLabel}>Value</Text>
                                <Text style={styles.detailValue}>
                                    {sensor.lastReading || 'N/A'} {sensor.type === SensorType.MOISTURE ? '%' : sensor.type === SensorType.WATER_LEVEL ? 'L' : ''}
                                </Text>
                            </View>
                            <View style={styles.detailRow}>
                                <Text style={styles.detailLabel}>Battery</Text>
                                <Text style={[styles.detailValue, (sensor.battery || 0) < 20 && { color: colors.danger }]}>
                                    {sensor.battery || 0}%
                                </Text>
                            </View>
                        </View>

                        <View style={styles.footer}>
                            {sensor.status === SensorStatus.ONLINE ? (
                                <>
                                    <Wifi color={colors.success} size={16} />
                                    <Text style={styles.footerText}>Connected</Text>
                                </>
                            ) : (
                                <>
                                    <WifiOff color={colors.danger} size={16} />
                                    <Text style={styles.footerText}>Disconnected</Text>
                                </>
                            )}
                        </View>
                    </View>
                ))}
            </View>
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: colors.surfaceHover,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: spacing.xl,
        paddingTop: spacing.xxl + spacing.md,
        backgroundColor: colors.background,
        borderBottomWidth: 1,
        borderBottomColor: colors.border,
    },
    headerIcon: {
        backgroundColor: colors.primaryLight,
        padding: spacing.sm,
        borderRadius: layout.borderRadiusSmall,
        marginRight: spacing.md,
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        color: colors.text,
    },
    list: {
        padding: spacing.md,
        gap: spacing.md,
    },
    card: {
        backgroundColor: colors.background,
        borderRadius: layout.borderRadius,
        padding: spacing.md,
        borderWidth: 1,
        borderColor: colors.border,
    },
    cardHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: spacing.md,
    },
    iconContainer: {
        padding: spacing.sm,
        backgroundColor: colors.primaryLight,
        borderRadius: layout.borderRadiusSmall,
    },
    iconContainerWarn: {
        backgroundColor: '#fef3c7',
    },
    badge: {
        paddingHorizontal: spacing.sm,
        paddingVertical: 4,
        borderRadius: layout.borderRadius || 12,
    },
    badgeSuccess: {
        backgroundColor: colors.primaryLight,
    },
    badgeWarn: {
        backgroundColor: '#fee2e2',
    },
    badgeText: {
        fontSize: 12,
        fontWeight: '600',
        color: colors.text,
    },
    details: {
        gap: spacing.sm,
    },
    detailRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
    detailLabel: {
        fontSize: 14,
        color: colors.textMedium,
    },
    detailValue: {
        fontSize: 14,
        fontWeight: '500',
        color: colors.text,
    },
    footer: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: spacing.xs,
        marginTop: spacing.md,
        paddingTop: spacing.md,
        borderTopWidth: 1,
        borderTopColor: colors.border,
    },
    footerText: {
        fontSize: 14,
        color: colors.textMedium,
    },
});
