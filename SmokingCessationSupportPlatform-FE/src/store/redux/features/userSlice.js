import { createSlice } from "@reduxjs/toolkit";

const userSlice = createSlice({
    name: "user",
    initialState: null,
    reducers: {
        login: (state, actions) => {
            state = actions.payload;
            return state;
        },

        logout: () => {
            localStorage.removeItem("token");
            return null;
        },
    },
});

export const { login, logout } = userSlice.actions;
export default userSlice.reducer;