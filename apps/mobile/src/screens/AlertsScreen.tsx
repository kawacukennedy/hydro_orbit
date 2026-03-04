import React from 'react';
import { View, Text, StyleSheet, ScrollView, RefreshControl, TouchableOpacity } from 'react-native';
import { useAlerts, useAcknowledgeAlert } from '../hooks/useApi';
import { colors, spacing, layout } from '../theme/colors';
import { BellRing, AlertOctagon, AlertTriangle, Info, Check } from 'lucide-react-native';
import { AlertSeverity } from '@hydro-orbit/shared-types';

export default function AlertsScreen() {
    const { data: alerts, isLoading, refetch } = useAlerts();
    const acknowledge = useAcknowledgeAlert();

    const getAlertIcon = (severity: string) => {
        switch (severity.toLowerCase()) {
            case 'critical': return <AlertOctagon color={colors.danger} size={20} />;
            case 'warning': return <AlertTriangle color={colors.warning} size={20} />;
            default: return <Info color={colors.info} size={20} />;
        }
    };

    const getAlertStyle = (severity: string) => {
        switch (severity.toLowerCase()) {
            case 'critical': return { backgroundColor: '#fee2e2', borderColor: '#fca5a5' };
            case 'warning': return { backgroundColor: '#fef3c7', borderColor: '#fcd34d' };
            default: return { backgroundColor: '#dbeafe', borderColor: '#bfdbfe' };
        }
    };

    return (
        <ScrollView
            style={styles.container}
            refreshControl={<RefreshControl refreshing={isLoading} onRefresh={refetch} />}
        >
            <View style={styles.header}>
                <View style={styles.headerIcon}>
                    <BellRing color={colors.primary} size={24} />
                </View>
                <Text style={styles.title}>Alerts</Text>
            </View>

            <View style={styles.filters}>
                <TouchableOpacity style={[styles.filterChip, styles.filterChipActive]}>
                    <Text style={styles.filterChipTextActive}>All</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.filterChip}>
                    <Text style={styles.filterChipText}>Unread</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.filterChip}>
                    <Text style={styles.filterChipText}>Critical</Text>
                </TouchableOpacity>
            </View>

            <View style={styles.list}>
                {alerts?.map((alert) => (
                    <View
                        key={alert.id}
                        style={[
                            styles.alertCard,
                            !alert.acknowledged && getAlertStyle(alert.severity),
                            alert.acknowledged && styles.alertCardRead
                        ]}
                    >
                        <View style={styles.alertHeader}>
                            <View style={styles.alertIconTitle}>
                                {getAlertIcon(alert.severity)}
                                <Text style={styles.alertTime}>
                                    {new Date(alert.createdAt as any).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                </Text>
                            </View>
                            {!alert.acknowledged && (
                                <TouchableOpacity
                                    style={styles.ackButton}
                                    onPress={() => acknowledge.mutate(alert.id)}
                                    disabled={acknowledge.isPending}
                                >
                                    <Check color={colors.textMedium} size={16} />
                                </TouchableOpacity>
                            )}
                        </View>
                        <Text style={styles.alertMessage}>{alert.message}</Text>
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
    filters: {
        flexDirection: 'row',
        padding: spacing.md,
        gap: spacing.sm,
    },
    filterChip: {
        paddingHorizontal: spacing.md,
        paddingVertical: spacing.sm,
        borderRadius: layout.borderRadius,
        borderWidth: 1,
        borderColor: colors.border,
        backgroundColor: colors.background,
    },
    filterChipActive: {
        backgroundColor: colors.primary,
        borderColor: colors.primary,
    },
    filterChipText: {
        color: colors.textMedium,
        fontWeight: '500',
    },
    filterChipTextActive: {
        color: colors.background,
        fontWeight: '500',
    },
    list: {
        padding: spacing.md,
        gap: spacing.sm,
    },
    alertCard: {
        padding: spacing.md,
        borderRadius: layout.borderRadius,
        borderWidth: 1,
        backgroundColor: colors.background,
        borderColor: colors.border,
    },
    alertCardRead: {
        opacity: 0.7,
        backgroundColor: colors.surface,
    },
    alertHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: spacing.xs,
    },
    alertIconTitle: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: spacing.sm,
    },
    alertTime: {
        fontSize: 12,
        color: colors.textMedium,
    },
    alertMessage: {
        fontSize: 16,
        color: colors.text,
        lineHeight: 22,
    },
    ackButton: {
        padding: 4,
    },
});
