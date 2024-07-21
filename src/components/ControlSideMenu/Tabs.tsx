import React, { useState } from "react";
import styles from './Tabs.module.scss';

interface TabsProps {
    tabs: string[];
    activeTab: string;
    onTabChange: (tab: string) => void;
}

const Tabs: React.FC<TabsProps> = ({ tabs, activeTab, onTabChange }) => {
    return (
        <div className={styles.tabs}>
            {tabs.map(tab => (
                <button
                    key={tab}
                    className={activeTab === tab ? styles.active : ""}
                    onClick={() => onTabChange(tab)}
                >
                    {tab}
                </button>
            ))}
        </div>
    );
};

export default Tabs;
