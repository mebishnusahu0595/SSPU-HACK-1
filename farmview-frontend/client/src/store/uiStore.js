import { create } from 'zustand';

export const useUIStore = create((set) => ({
    isTodoOpen: false,
    isCalculatorOpen: false,
    isChatbotOpen: false,

    toggleTodo: () => set((state) => ({
        isTodoOpen: !state.isTodoOpen,
        isCalculatorOpen: false,
        isChatbotOpen: false
    })),

    toggleCalculator: () => set((state) => ({
        isCalculatorOpen: !state.isCalculatorOpen,
        isTodoOpen: false,
        isChatbotOpen: false
    })),

    toggleChatbot: () => set((state) => ({
        isChatbotOpen: !state.isChatbotOpen,
        isTodoOpen: false,
        isCalculatorOpen: false
    })),

    closeAll: () => set({
        isTodoOpen: false,
        isCalculatorOpen: false,
        isChatbotOpen: false
    })
}));
