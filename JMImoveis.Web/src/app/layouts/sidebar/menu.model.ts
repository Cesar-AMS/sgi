export interface MenuItem {
    id?: number;
    label?: any;
    icon?: string;
    link?: string;
    subItems?: MenuItem[];
    isTitle?: boolean;
    badge?: any;
    parentId?: number;
    isLayout?: boolean;
    isOpen?: boolean;
    permissionKey?: string;
    permissionKeys?: string[];
    isNew?: boolean;
    disabled?: boolean;
    alwaysVisible?: boolean;
}
