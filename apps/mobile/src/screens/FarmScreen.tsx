import React from 'react';
import { View, Text, StyleSheet, ScrollView, RefreshControl, TouchableOpacity } from 'react-native';
import { useFarm, useFarmStats } from '../hooks/useApi';
import { colors, spacing, layout } from '../theme/colors';
import { MapPin, Droplet, TestTube, CheckCircle, XCircle, AlertCircle } from 'lucide-react-native';

export default function FarmScreen() {
    const { data: farm, isLoading: isFarmLoading, refetch: refetchFarm } = useFarm('farm-1');
    const { data: stats, isLoading: isStatsLoading, refetch: refetchStats } = useFarmStats('farm-1');

    const refreshing = isFarmLoading || isStatsLoading;
    const onRefresh = () => {
        refetchFarm();
        refetchStats();
    };

    const getStatusIcon = (status: 'good' | 'dry' | 'wet') => {
        switch (status) {
            case 'good': return <CheckCircle color={colors.success} size={20} />;
            case 'dry': return <AlertCircle color={colors.warning} size={20} />;
            case 'wet': return <XCircle color={colors.info} size={20} />;
        }
    };

    return (
        <ScrollView
            style={styles.container}
            refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        >
            <View style={styles.header}>
                <View style={styles.headerIcon}>
                    <MapPin color={colors.primary} size={24} />
                </View>
                <View>
                    <Text style={styles.title}>{farm?.name || 'My Farm'}</Text>
                    <Text style={styles.subtitle}>{farm?.location || 'Location'}</Text>
                </View>
            </View>

            <View style={styles.section}>
                <Text style={styles.sectionTitle}>Farm Map</Text>
                <View style={styles.mapContainer}>
                    <View style={styles.zonesGrid}>
                        {farm?.zones.map((zone: any, i: number) => {
                            const isDry = zone.moistureThreshold > 25;
                            const status = isDry ? 'dry' : 'good';
                            return (
                                <View
                                    key={i}
                                    style={[
                                        styles.zoneBox,
                                        status === 'dry' ? styles.zoneBoxDry : styles.zoneBoxGood
                                    ]}
                                >
                                    <Text style={styles.zoneName}>{zone.name}</Text>
                                    <Text style={styles.zoneCrop}>{zone.cropType}</Text>
                                </View>
                            );
                        })}
                    </View>
                </View>
            </View>

            <View style={styles.section}>
                <Text style={styles.sectionTitle}>Zones</Text>
                {farm?.zones.map((zone: any, i: number) => {
                    const isDry = zone.moistureThreshold > 25;
                    const status = isDry ? 'dry' : 'good';

                    return (
                        <View key={i} style={styles.zoneCard}>
                            <View style={styles.zoneHeader}>
                                {getStatusIcon(status)}
                                <View style={styles.zoneInfo}>
                                    <Text style={styles.zoneName}>{zone.name}</Text>
                                    <Text style={styles.zoneSubtitle}>Threshold: {zone.moistureThreshold}%</Text>
                                </View>
                            </View>

                            <View style={styles.zoneStats}>
                                <View style={styles.zoneStat}>
                                    <Droplet color={colors.info} size={16} />
                                    <Text style={styles.zoneStatValue}>--</Text>
                                </View>
                                <View style={styles.zoneStat}>
                                    <TestTube color={colors.success} size={16} />
                                    <Text style={styles.zoneStatValue}>--</Text>
                                </View>
                                <TouchableOpacity style={styles.waterButton}>
                                    <Text style={styles.waterButtonText}>Water Now</Text>
                                </TouchableOpacity>
                            </View>
                        </View>
                    );
                })}
            </View>

            <View style={[styles.section, styles.statsGrid]}>
                <View style={styles.statCard}>
                    <Text style={styles.statValue}>{farm?.area || '--'} ha</Text>
                    <Text style={styles.statLabel}>Total Area</Text>
                </View>
                <View style={styles.statCard}>
                    <Text style={styles.statValue}>{stats?.activeSensors || 0}</Text>
                    <Text style={styles.statLabel}>Active Sensors</Text>
                </View>
                <View style={styles.statCard}>
                    <Text style={styles.statValue}>{stats?.waterUsageToday || 0} L</Text>
                    <Text style={styles.statLabel}>Water Used Today</Text>
                </View>
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
    subtitle: {
        fontSize: 14,
        color: colors.textMedium,
    },
    section: {
        padding: spacing.md,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: colors.text,
        marginBottom: spacing.md,
    },
    mapContainer: {
        backgroundColor: colors.surface,
        height: 200,
        borderRadius: layout.borderRadius,
        padding: spacing.md,
        borderWidth: 1,
        borderColor: colors.border,
    },
    zonesGrid: {
        flex: 1,
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: spacing.sm,
    },
    zoneBox: {
        flex: 1,
        minWidth: '45%',
        alignItems: 'center',
        justifyContent: 'center',
        padding: spacing.md,
        borderRadius: layout.borderRadiusSmall,
        borderWidth: 2,
    },
    zoneBoxDry: {
        backgroundColor: '#ffedd5',
        borderColor: '#fdba74',
    },
    zoneBoxGood: {
        backgroundColor: colors.primaryLight,
        borderColor: '#6ee7b7',
    },
    zoneCard: {
        backgroundColor: colors.background,
        padding: spacing.md,
        borderRadius: layout.borderRadius,
        marginBottom: spacing.sm,
        borderWidth: 1,
        borderColor: colors.border,
    },
    zoneHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: spacing.md,
    },
    zoneInfo: {
        marginLeft: spacing.sm,
    },
    zoneName: {
        fontSize: 16,
        fontWeight: '600',
        color: colors.text,
    },
    zoneCrop: {
        fontSize: 12,
        color: colors.textMedium,
        fontWeight: 'bold',
    },
    zoneSubtitle: {
        fontSize: 12,
        color: colors.textLight,
    },
    zoneStats: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    zoneStat: {
        alignItems: 'center',
    },
    zoneStatValue: {
        fontSize: 14,
        fontWeight: '600',
        color: colors.text,
        marginTop: 4,
    },
    waterButton: {
        borderWidth: 1,
        borderColor: colors.border,
        paddingHorizontal: spacing.md,
        paddingVertical: spacing.sm,
        borderRadius: layout.borderRadiusSmall,
    },
    waterButtonText: {
        color: colors.text,
        fontWeight: '600',
        fontSize: 12,
    },
    statsGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: spacing.sm,
        marginBottom: spacing.xl,
    },
    statCard: {
        flex: 1,
        minWidth: '30%',
        backgroundColor: colors.background,
        padding: spacing.md,
        borderRadius: layout.borderRadius,
        alignItems: 'center',
        borderWidth: 1,
        borderColor: colors.border,
    },
    statValue: {
        fontSize: 18,
        fontWeight: 'bold',
        color: colors.text,
        marginBottom: 4,
    },
    statLabel: {
        fontSize: 11,
        color: colors.textMedium,
        textAlign: 'center',
    },
});
