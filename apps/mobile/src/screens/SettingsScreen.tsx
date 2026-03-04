import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput } from 'react-native';
import { useSettingsStore } from '../stores/settingsStore';
import { colors, spacing, layout } from '../theme/colors';
import { Settings, User, Bell, Save } from 'lucide-react-native';

export default function SettingsScreen() {
    const { notifications, setNotifications } = useSettingsStore();

    return (
        <ScrollView style={styles.container}>
            <View style={styles.header}>
                <View style={styles.headerIcon}>
                    <Settings color={colors.primary} size={24} />
                </View>
                <Text style={styles.title}>Settings</Text>
            </View>

            <View style={styles.section}>
                <View style={styles.sectionHeader}>
                    <User color={colors.textMedium} size={20} />
                    <Text style={styles.sectionTitle}>Profile</Text>
                </View>
                <View style={styles.card}>
                    <View style={styles.inputGroup}>
                        <Text style={styles.label}>Name</Text>
                        <TextInput style={styles.input} defaultValue="Farmer" />
                    </View>
                    <View style={styles.inputGroup}>
                        <Text style={styles.label}>Email</Text>
                        <TextInput style={styles.input} defaultValue="farmer@hydro-orbit.com" />
                    </View>
                    <TouchableOpacity style={styles.button}>
                        <Save color={colors.background} size={16} />
                        <Text style={styles.buttonText}>Save Profile</Text>
                    </TouchableOpacity>
                </View>
            </View>

            <View style={styles.section}>
                <View style={styles.sectionHeader}>
                    <Bell color={colors.textMedium} size={20} />
                    <Text style={styles.sectionTitle}>Notifications</Text>
                </View>
                <View style={styles.card}>
                    <View style={styles.toggleRow}>
                        <Text style={styles.toggleLabel}>Push Notifications</Text>
                        <TouchableOpacity
                            style={[styles.toggle, notifications.push && styles.toggleActive]}
                            onPress={() => setNotifications({ ...notifications, push: !notifications.push })}
                        >
                            <View style={[styles.toggleKnob, notifications.push && styles.toggleKnobActive]} />
                        </TouchableOpacity>
                    </View>
                    <View style={styles.toggleDivider} />
                    <View style={styles.toggleRow}>
                        <Text style={styles.toggleLabel}>SMS Alerts</Text>
                        <TouchableOpacity
                            style={[styles.toggle, notifications.sms && styles.toggleActive]}
                            onPress={() => setNotifications({ ...notifications, sms: !notifications.sms })}
                        >
                            <View style={[styles.toggleKnob, notifications.sms && styles.toggleKnobActive]} />
                        </TouchableOpacity>
                    </View>
                    <View style={styles.toggleDivider} />
                    <View style={styles.toggleRow}>
                        <Text style={styles.toggleLabel}>Email Summaries</Text>
                        <TouchableOpacity
                            style={[styles.toggle, notifications.email && styles.toggleActive]}
                            onPress={() => setNotifications({ ...notifications, email: !notifications.email })}
                        >
                            <View style={[styles.toggleKnob, notifications.email && styles.toggleKnobActive]} />
                        </TouchableOpacity>
                    </View>
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
    section: {
        padding: spacing.md,
        marginTop: spacing.md,
    },
    sectionHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: spacing.sm,
        marginBottom: spacing.md,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: colors.textMedium,
    },
    card: {
        backgroundColor: colors.background,
        borderRadius: layout.borderRadius,
        padding: spacing.md,
        borderWidth: 1,
        borderColor: colors.border,
    },
    inputGroup: {
        marginBottom: spacing.md,
    },
    label: {
        fontSize: 14,
        color: colors.textMedium,
        marginBottom: 4,
    },
    input: {
        borderWidth: 1,
        borderColor: colors.border,
        borderRadius: layout.borderRadiusSmall,
        padding: spacing.md,
        fontSize: 16,
        color: colors.text,
    },
    button: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: spacing.xs,
        backgroundColor: colors.primary,
        padding: spacing.md,
        borderRadius: layout.borderRadiusSmall,
        marginTop: spacing.sm,
    },
    buttonText: {
        color: colors.background,
        fontWeight: '600',
        fontSize: 16,
    },
    toggleRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingVertical: spacing.sm,
    },
    toggleLabel: {
        fontSize: 16,
        color: colors.text,
    },
    toggleDivider: {
        height: 1,
        backgroundColor: colors.border,
    },
    toggle: {
        width: 50,
        height: 30,
        backgroundColor: colors.border,
        borderRadius: 15,
        padding: 2,
        justifyContent: 'center',
    },
    toggleActive: {
        backgroundColor: colors.primary,
    },
    toggleKnob: {
        width: 26,
        height: 26,
        backgroundColor: colors.background,
        borderRadius: 13,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 2,
        elevation: 2,
    },
    toggleKnobActive: {
        transform: [{ translateX: 20 }],
    },
});
