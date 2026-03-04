import React from 'react';
import { View, Text, StyleSheet, ScrollView, RefreshControl, TouchableOpacity } from 'react-native';
import { useAuthStore } from '../stores/authStore';
import { useSensors, useAlerts, useFarms } from '../hooks/useApi';
import { colors, spacing, layout } from '../theme/colors';
import { AlertTriangle, Droplet, Gauge, TestTube, Map, Activity, Hand, LayoutDashboard } from 'lucide-react-native';
import { SensorStatus, AlertSeverity } from '@hydro-orbit/shared-types';
import { useNavigation } from '@react-navigation/native';

export default function DashboardScreen() {
    const { user } = useAuthStore();
    const navigation = useNavigation<any>();
    const { data: farms, isLoading: isLoadingFarms, refetch: refetchFarms } = useFarms();
    const { data: sensors, isLoading: isLoadingSensors } = useSensors();
    const { data: alerts, isLoading: isLoadingAlerts } = useAlerts(true);

    const refreshing = isLoadingFarms || isLoadingSensors || isLoadingAlerts;
    const onRefresh = () => {
        refetchFarms();
    };

    const farm = farms?.[0]; // Mock single farm

    const getActiveSensors = () => sensors?.filter(s => s.status === SensorStatus.ONLINE).length || 0;
    const getCriticalAlerts = () => alerts?.filter(a => a.severity === AlertSeverity.CRITICAL).length || 0;
    const getWarningAlerts = () => alerts?.filter(a => a.severity === AlertSeverity.WARNING).length || 0;

    return (
        <ScrollView
            style={styles.container}
            refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        >
            <View style={styles.header}>
                <Text style={styles.title}>Dashboard</Text>
                <Text style={styles.subtitle}>Welcome back, {user?.name || 'Farmer'}!</Text>
            </View>

            <View style={styles.statsCard}>
                <View style={styles.statItem}>
                    <Map color={colors.primary} size={24} />
                    <Text style={styles.statValue}>{farm?.area || '--'} ha</Text>
                    <Text style={styles.statLabel}>Total Area</Text>
                </View>
                <View style={styles.statDivider} />
                <View style={styles.statItem}>
                    <Gauge color={colors.primary} size={24} />
                    <Text style={styles.statValue}>{getActiveSensors()}/{sensors?.length || 0}</Text>
                    <Text style={styles.statLabel}>Active Sensors</Text>
                </View>
            </View>

            <View style={styles.section}>
                <Text style={styles.sectionTitle}>System Status</Text>
                <View style={styles.statusCards}>
                    <View style={[styles.statusCard, { backgroundColor: colors.surfaceHover }]}>
                        <View style={styles.statusIconContainer}>
                            <Droplet color={colors.info} size={24} />
                        </View>
                        <Text style={styles.statusValue}>Normal</Text>
                        <Text style={styles.statusLabel}>Irrigation</Text>
                    </View>
                    <View style={[styles.statusCard, { backgroundColor: colors.surfaceHover }]}>
                        <View style={styles.statusIconContainer}>
                            <TestTube color={colors.success} size={24} />
                        </View>
                        <Text style={styles.statusValue}>6.8</Text>
                        <Text style={styles.statusLabel}>Avg pH</Text>
                    </View>
                    <View style={[styles.statusCard,
                    { backgroundColor: getCriticalAlerts() > 0 ? '#fee2e2' : colors.surfaceHover }
                    ]}>
                        <View style={styles.statusIconContainer}>
                            <AlertTriangle color={getCriticalAlerts() > 0 ? colors.danger : colors.warning} size={24} />
                        </View>
                        <Text style={[styles.statusValue, { color: getCriticalAlerts() > 0 ? colors.danger : colors.text }]}>
                            {getCriticalAlerts() > 0 ? `${getCriticalAlerts()} Critical` : `${getWarningAlerts()} Warnings`}
                        </Text>
                        <Text style={styles.statusLabel}>Alerts</Text>
                    </View>
                </View>
            </View>

            <View style={styles.section}>
                <Text style={styles.sectionTitle}>Quick Actions</Text>
                <View style={styles.actionGrid}>
                    <TouchableOpacity
                        style={styles.actionCard}
                        onPress={() => navigation.navigate('Irrigation')}
                    >
                        <View style={[styles.actionIcon, { backgroundColor: colors.primaryLight }]}>
                            <Hand color={colors.primary} size={24} />
                        </View>
                        <Text style={styles.actionLabel}>Manual Water</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={styles.actionCard}
                        onPress={() => navigation.navigate('Farm')}
                    >
                        <View style={[styles.actionIcon, { backgroundColor: '#dbeafe' }]}>
                            <LayoutDashboard color="#2563eb" size={24} />
                        </View>
                        <Text style={styles.actionLabel}>View Farm</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={styles.actionCard}
                        onPress={() => navigation.navigate('Sensors')}
                    >
                        <View style={[styles.actionIcon, { backgroundColor: '#f3f4f6' }]}>
                            <Activity color="#4b5563" size={24} />
                        </View>
                        <Text style={styles.actionLabel}>Sensors</Text>
                    </TouchableOpacity>
                </View>
            </View>
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: colors.surface,
    },
    header: {
        padding: spacing.xl,
        paddingTop: spacing.xxl + spacing.md,
        backgroundColor: colors.background,
    },
    title: {
        fontSize: 28,
        fontWeight: 'bold',
        color: colors.text,
    },
    subtitle: {
        fontSize: 16,
        color: colors.textMedium,
        marginTop: spacing.xs,
    },
    statsCard: {
        flexDirection: 'row',
        backgroundColor: colors.background,
        margin: spacing.md,
        padding: spacing.lg,
        borderRadius: layout.borderRadius,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 2,
        elevation: 2,
    },
    statItem: {
        flex: 1,
        alignItems: 'center',
    },
    statDivider: {
        width: 1,
        backgroundColor: colors.border,
        marginHorizontal: spacing.md,
    },
    statValue: {
        fontSize: 20,
        fontWeight: 'bold',
        color: colors.text,
        marginTop: spacing.sm,
    },
    statLabel: {
        fontSize: 12,
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
    statusCards: {
        flexDirection: 'row',
        gap: spacing.md,
    },
    statusCard: {
        flex: 1,
        padding: spacing.md,
        borderRadius: layout.borderRadius,
        alignItems: 'center',
    },
    statusIconContainer: {
        backgroundColor: colors.background,
        padding: spacing.sm,
        borderRadius: layout.borderRadiusSmall,
        marginBottom: spacing.sm,
    },
    statusValue: {
        fontSize: 14,
        fontWeight: 'bold',
        color: colors.text,
    },
    statusLabel: {
        fontSize: 12,
        color: colors.textMedium,
    },
    actionGrid: {
        flexDirection: 'row',
        gap: spacing.md,
    },
    actionCard: {
        flex: 1,
        backgroundColor: colors.background,
        padding: spacing.md,
        borderRadius: layout.borderRadius,
        alignItems: 'center',
        borderWidth: 1,
        borderColor: colors.border,
    },
    actionIcon: {
        padding: spacing.md,
        borderRadius: layout.borderRadiusSmall,
        marginBottom: spacing.sm,
    },
    actionLabel: {
        fontSize: 12,
        fontWeight: '600',
        color: colors.text,
        textAlign: 'center',
    },
});
