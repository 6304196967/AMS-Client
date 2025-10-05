import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

const Attendance: React.FC = () => {
    return (
        <View style={styles.container}>
            <Text style={styles.title}>Analytics</Text>
            <Text>This is a dummy page for Attendance.</Text>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        padding: 32,
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        marginBottom: 16,
    },
});
export default Attendance;