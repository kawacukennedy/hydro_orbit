import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, RefreshControl, TouchableOpacity } from 'react-native';
import { useIrrigationStatus, useIrrigationSchedules, useFarm, useStartManualIrrigation, useSetIrrigationMode } from '../hooks/useApi';
import { colors, spacing, layout } from '../theme/colors';
import { Sprout, Droplet } from 'lucide-react-native';

export default function IrrigationScreen() {
    const { data: status, refetch: refetchStatus, isLoading: loadingStatus } = useIrrigationStatus();
    const { data: schedules, refetch: refetchSchedules, isLoading: loadingSchedules } = useIrrigationSchedules();
    const { data: farm, refetch: refetchFarm, isLoading: loadingFarm } = useFarm('farm-1');

    const setModeFn = useSetIrrigationMode();
    const startManual = useStartManualIrrigation();

    const refreshing = loadingStatus || loadingSchedules || loadingFarm;
    const onRefresh = () => {
        refetchStatus();
        refetchSchedules();
        refetchFarm();
    };

    const mode = status?.mode || 'auto';

    return (
        <ScrollView
            style={styles.container}
            refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        >
            <View style={styles.header}>
                <View style={styles.headerIcon}>
                    <Sprout color={colors.primary} size={24} />
                </View>
                <Text style={styles.title}>Irrigation Control</Text>
            </View>

            <View style={styles.section}>
                <Text style={styles.sectionTitle}>Mode</Text>
                <View style={styles.modeCards}>
                    {['auto', 'manual', 'schedule'].map((m) => (
                        <TouchableOpacity
                            key={m}
                            style={[styles.modeCard, mode === m && styles.modeCardActive]}
                            onPress={() => setModeFn.mutate({ mode: m as any })}
                        >
                            <Text style={[styles.modeTitle, mode === m && styles.modeTitleActive]}>
                                {m.charAt(0).toUpperCase() + m.slice(1)}
                            </Text>
                        </TouchableOpacity>
                    ))}
                </View>
            </View>

            {mode === 'manual' && (
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Manual Control</Text>
                    {farm?.zones.map((zone: any) => (
                        <View key={zone.id} style={styles.zoneCard}>
                            <View style={styles.zoneHeader}>
                                <View>
                                    <Text style={styles.zoneName}>{zone.name}</Text>
                                    <Text style={styles.zoneSubtitle}>Threshold: {zone.moistureThreshold}%</Text>
                                </View>
                                <TouchableOpacity
                                    style={[styles.waterButton, (status?.status === 'active' || startManual.isPending) && styles.waterButtonDisabled]}
                                    onPress={() => startManual.mutate({ zoneId: zone.id, duration: 15 })}
                                    disabled={status?.status === 'active' || startManual.isPending}
                                >
                                    <Droplet color={status?.status === 'active' ? colors.textLight : colors.info} size={16} />
                                    <Text style={styles.waterButtonText}>Water (15m)</Text>
                                </TouchableOpacity>
                            </View>
                        </View>
                    ))}
                </View>
            )}

            {mode === 'schedule' && (
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Schedules</Text>
                    {schedules?.map((schedule) => (
                        <View key={schedule.id} style={styles.scheduleCard}>
                            <View>
                                <Text style={styles.scheduleZone}>
                                    {farm?.zones.find((z: any) => z.id === schedule.zoneId)?.name || 'Zone'}
                                </Text>
                                <Text style={styles.scheduleInfo}>
                                    {schedule.days.join(', ')} at {schedule.time} • {schedule.duration} min
                                </Text>
                            </View>
                        </View>
                    ))}
                    <TouchableOpacity style={styles.addButton}>
                        <Text style={styles.addButtonText}>+ Add Schedule</Text>
                    </TouchableOpacity>
                </View>
            )}

            <View style={styles.statusSection}>
                <Text style={styles.statusLabel}>Current Status</Text>
                <Text style={[styles.statusValue, status?.status === 'active' && styles.statusValueActive]}>
                    {(status?.status || 'idle').toUpperCase()}
                </Text>
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
    section: {
        padding: spacing.md,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: colors.text,
        marginBottom: spacing.md,
    },
    modeCards: {
        flexDirection: 'row',
        gap: spacing.sm,
    },
    modeCard: {
        flex: 1,
        padding: spacing.md,
        backgroundColor: colors.background,
        borderWidth: 2,
        borderColor: colors.border,
        borderRadius: layout.borderRadiusSmall,
        alignItems: 'center',
    },
    modeCardActive: {
        borderColor: colors.primary,
        backgroundColor: colors.primaryLight,
    },
    modeTitle: {
        fontWeight: '600',
        color: colors.textMedium,
    },
    modeTitleActive: {
        color: colors.primaryDark,
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
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    zoneName: {
        fontSize: 16,
        fontWeight: 'bold',
        color: colors.text,
    },
    zoneSubtitle: {
        fontSize: 12,
        color: colors.textLight,
    },
    waterButton: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: spacing.xs,
        backgroundColor: colors.surfaceHover,
        paddingHorizontal: spacing.md,
        paddingVertical: spacing.sm,
        borderRadius: layout.borderRadiusSmall,
        borderWidth: 1,
        borderColor: colors.border,
    },
    waterButtonDisabled: {
        opacity: 0.5,
    },
    waterButtonText: {
        fontWeight: '600',
        color: colors.text,
    },
    scheduleCard: {
        backgroundColor: colors.background,
        padding: spacing.md,
        borderRadius: layout.borderRadius,
        marginBottom: spacing.sm,
        borderWidth: 1,
        borderColor: colors.border,
    },
    scheduleZone: {
        fontSize: 16,
        fontWeight: 'bold',
        color: colors.text,
    },
    scheduleInfo: {
        fontSize: 14,
        color: colors.textMedium,
        marginTop: 4,
    },
    addButton: {
        borderWidth: 1,
        borderColor: colors.border,
        borderStyle: 'dashed',
        padding: spacing.md,
        borderRadius: layout.borderRadius,
        alignItems: 'center',
    },
    addButtonText: {
        color: colors.textMedium,
        fontWeight: '600',
    },
    statusSection: {
        margin: spacing.md,
        padding: spacing.lg,
        backgroundColor: colors.background,
        borderRadius: layout.borderRadius,
        alignItems: 'center',
        borderWidth: 1,
        borderColor: colors.border,
        marginBottom: spacing.xxl,
    },
    statusLabel: {
        fontSize: 14,
        color: colors.textMedium,
        marginBottom: spacing.xs,
    },
    statusValue: {
        fontSize: 24,
        fontWeight: 'bold',
        color: colors.text,
    },
    statusValueActive: {
        color: colors.primary,
    },
});
