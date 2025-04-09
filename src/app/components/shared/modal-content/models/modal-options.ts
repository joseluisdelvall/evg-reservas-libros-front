export interface ModalOptions {

    title: string;
    modalId: string;
    size?: 'sm' | 'lg' | 'xl';
    okButton?: {
        text: string;
        class?: string;
        iconClass?: string;
    };
    cancelButton?: {
        text: string;
        class?: string;
        iconClass?: string;
    };
}