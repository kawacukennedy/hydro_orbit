import { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, KeyboardAvoidingView, Platform, ActivityIndicator } from 'react-native';
import { useAuthStore } from '../stores/authStore';
import { colors, layout, spacing } from '../theme/colors';
import { Leaf } from 'lucide-react-native';

export default function LoginScreen() {
    const { login, isLoading, error } = useAuthStore();
    const [phone, setPhone] = useState('0788123456');
    const [password, setPassword] = useState('password123');

    const handleLogin = async () => {
        await login(phone, password);
    };

    return (
        <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            style={styles.container}
        >
            <View style={styles.formContainer}>
                <View style={styles.header}>
                    <View style={styles.logoContainer}>
                        <Leaf color={colors.primary} size={40} />
                    </View>
                    <Text style={styles.title}>Hydro-Orbit</Text>
                    <Text style={styles.subtitle}>Sign in to your account</Text>
                </View>

                <View style={styles.inputContainer}>
                    <Text style={styles.label}>Phone Number</Text>
                    <TextInput
                        style={styles.input}
                        value={phone}
                        onChangeText={setPhone}
                        keyboardType="phone-pad"
                        autoCapitalize="none"
                    />
                </View>

                <View style={styles.inputContainer}>
                    <Text style={styles.label}>Password</Text>
                    <TextInput
                        style={styles.input}
                        value={password}
                        onChangeText={setPassword}
                        secureTextEntry
                    />
                </View>

                {error && <Text style={styles.errorText}>{error}</Text>}

                <TouchableOpacity
                    style={styles.button}
                    onPress={handleLogin}
                    disabled={isLoading}
                >
                    {isLoading ? (
                        <ActivityIndicator color={colors.background} />
                    ) : (
                        <Text style={styles.buttonText}>Sign in</Text>
                    )}
                </TouchableOpacity>
            </View>
        </KeyboardAvoidingView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: colors.surfaceHover,
    },
    formContainer: {
        flex: 1,
        padding: spacing.xl,
        justifyContent: 'center',
    },
    header: {
        alignItems: 'center',
        marginBottom: spacing.xxl,
    },
    logoContainer: {
        backgroundColor: colors.primaryLight,
        padding: spacing.md,
        borderRadius: spacing.md,
        marginBottom: spacing.md,
    },
    title: {
        fontSize: 28,
        fontWeight: 'bold',
        color: colors.text,
        marginBottom: spacing.sm,
    },
    subtitle: {
        fontSize: 16,
        color: colors.textMedium,
    },
    inputContainer: {
        marginBottom: spacing.lg,
    },
    label: {
        fontSize: 14,
        fontWeight: '500',
        color: colors.textMedium,
        marginBottom: spacing.sm,
    },
    input: {
        backgroundColor: colors.background,
        borderWidth: 1,
        borderColor: colors.border,
        borderRadius: layout.borderRadiusSmall,
        padding: spacing.md,
        fontSize: 16,
        color: colors.text,
    },
    button: {
        backgroundColor: colors.primary,
        borderRadius: layout.borderRadiusSmall,
        padding: spacing.md,
        alignItems: 'center',
        marginTop: spacing.md,
    },
    buttonText: {
        color: colors.background,
        fontSize: 16,
        fontWeight: 'bold',
    },
    errorText: {
        color: colors.danger,
        marginBottom: spacing.md,
        textAlign: 'center',
    },
});
