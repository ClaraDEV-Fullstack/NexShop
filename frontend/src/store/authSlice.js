import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { authAPI } from '../api/api';

// Login thunk
export const loginUser = createAsyncThunk(
    'auth/login',
    async (credentials, { rejectWithValue }) => {
        try {
            const response = await authAPI.login(credentials);
            localStorage.setItem('accessToken', response.data.access);
            localStorage.setItem('refreshToken', response.data.refresh);
            const profileResponse = await authAPI.getProfile();
            return profileResponse.data;
        } catch (error) {
            return rejectWithValue(error.response?.data || 'Login failed');
        }
    }
);

// Register thunk
export const registerUser = createAsyncThunk(
    'auth/register',
    async (userData, { rejectWithValue }) => {
        try {
            await authAPI.register(userData);
            return { success: true };
        } catch (error) {
            return rejectWithValue(error.response?.data || 'Registration failed');
        }
    }
);

// Logout thunk
export const logoutUser = createAsyncThunk('auth/logout', async () => {
    try {
        const refresh = localStorage.getItem('refreshToken');
        await authAPI.logout(refresh);
    } catch (error) {
        // Logout anyway
    } finally {
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
    }
});

// Load user from token
export const loadUser = createAsyncThunk(
    'auth/loadUser',
    async (_, { rejectWithValue }) => {
        try {
            const token = localStorage.getItem('accessToken');
            if (!token) return null;
            const response = await authAPI.getProfile();
            return response.data;
        } catch (error) {
            localStorage.removeItem('accessToken');
            localStorage.removeItem('refreshToken');
            return rejectWithValue('Session expired');
        }
    }
);

const authSlice = createSlice({
    name: 'auth',
    initialState: {
        user: null,
        isAuthenticated: false,
        isLoading: false,
        error: null,
    },
    reducers: {
        clearError: (state) => { state.error = null; },
        setCredentials: (state, action) => {
            state.user = action.payload.user;
            state.isAuthenticated = true;
            state.isLoading = false;
            state.error = null;
        },
    },
    extraReducers: (builder) => {
        builder
            // Login
            .addCase(loginUser.pending, (state) => { state.isLoading = true; state.error = null; })
            .addCase(loginUser.fulfilled, (state, action) => {
                state.isLoading = false;
                state.isAuthenticated = true;
                state.user = action.payload;
            })
            .addCase(loginUser.rejected, (state, action) => {
                state.isLoading = false;
                state.error = action.payload;
            })
            // Register
            .addCase(registerUser.pending, (state) => { state.isLoading = true; state.error = null; })
            .addCase(registerUser.fulfilled, (state) => { state.isLoading = false; })
            .addCase(registerUser.rejected, (state, action) => {
                state.isLoading = false;
                state.error = action.payload;
            })
            // Logout
            .addCase(logoutUser.fulfilled, (state) => {
                state.user = null;
                state.isAuthenticated = false;
            })
            // Load User
            .addCase(loadUser.fulfilled, (state, action) => {
                if (action.payload) {
                    state.user = action.payload;
                    state.isAuthenticated = true;
                }
            })
            .addCase(loadUser.rejected, (state) => {
                state.user = null;
                state.isAuthenticated = false;
            });
    },
});

export const { clearError, setCredentials } = authSlice.actions;
export default authSlice.reducer;