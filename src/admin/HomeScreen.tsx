import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Text } from '../components';

const API_BASE_URL = 'https://ams-server-4eol.onrender.com';

const HomeScreen = () => {
    return (
        <View style={styles.container}>
            <Text>Welcome to the Admin Home Screen!</Text>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
});

export default HomeScreen;