import React from 'react';
import { View, Text, StyleSheet, ScrollView, RefreshControl } from 'react-native';
import { useIrrigationHistory, useFarm } from '../hooks/useApi';
import { colors, spacing, layout } from '../theme/colors';
import { CalendarClock, Sprout, Droplet, Clock } from 'lucide-react-native';

export default function HistoryScreen() {
    const { data: history, isLoading, refetch } = useIrrigationHistory();
    const { data: farm } = useFarm('farm-1');

    const formatTime = (dateStr: string | Date) => {
        return new Date(dateStr).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    };

    const formatDate = (dateStr: string | Date) => {
        return new Date(dateStr).toLocaleDateString([], { month: 'short', day: 'numeric' });
    };

    return (
        <ScrollView
            style={styles.container}
            refreshControl={<RefreshControl refreshing={isLoading} onRefresh={refetch} />}
        >
            <View style={styles.header}>
                <View style={styles.headerIcon}>
                    <CalendarClock color={colors.primary} size={24} />
                </View>
                <Text style={styles.title}>Irrigation History</Text>
            </View>

            <View style={styles.list}>
                {history?.map((event) => (
                    <View key={event.id} style={styles.card}>
                        <View style={styles.cardLeft}>
                            <View style={styles.iconContainer}>
                                <Sprout color={colors.primary} size={20} />
                            </View>
                            <View style={styles.info}>
                                <Text style={styles.zoneName}>
                                    {farm?.zones.find(z => z.id === event.zoneId)?.name || 'Zone'}
                                </Text>
                                <View style={styles.timeRow}>
                                    <Clock size={12} color={colors.textLight} />
                                    <Text style={styles.timeText}>{formatDate(event.startTime)} at {formatTime(event.startTime)}</Text>
                                </View>
                            </View>
                        </View>
                        <View style={styles.cardRight}>
                            <View style={styles.stat}>
                                <Droplet size={14} color={colors.info} />
                                <Text style={styles.statText}>{event.volume} L</Text>
                            </View>
                            <Text style={styles.duration}>{event.duration} min</Text>
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
        gap: spacing.sm,
    },
    card: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        backgroundColor: colors.background,
        padding: spacing.md,
        borderRadius: layout.borderRadius,
        borderWidth: 1,
        borderColor: colors.border,
    },
    cardLeft: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: spacing.md,
    },
    iconContainer: {
        backgroundColor: colors.primaryLight,
        padding: spacing.sm,
        borderRadius: layout.borderRadiusSmall,
    },
    info: {
        gap: 2,
    },
    zoneName: {
        fontSize: 16,
        fontWeight: 'bold',
        color: colors.text,
    },
    timeRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
    },
    timeText: {
        fontSize: 12,
        color: colors.textMedium,
    },
    cardRight: {
        alignItems: 'flex-end',
        gap: 4,
    },
    stat: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
    },
    statText: {
        fontSize: 14,
        fontWeight: 'bold',
        color: colors.info,
    },
    duration: {
        fontSize: 12,
        color: colors.textLight,
    },
});
