/**
 * Utility functions for optimizing message rendering
 */

// Message height configuration for different message types
export const MESSAGE_ITEM_HEIGHTS = {
    text: 70,
    IMAGE: 240,
    VIDEO: 240,
    DOCUMENT: 100,
    AUDIO: 80,
    contact: 100,
    poll: 150,
    default: 70,
};

// Cache for storing calculated message heights
export class MessageHeightCache {
    private cache: Map<string, number>;

    constructor() {
        this.cache = new Map<string, number>();
    }

    /**
     * Get the height of a message from the cache
     * @param messageId - The ID of the message
     * @param defaultHeight - Default height to return if not found
     * @returns The height of the message
     */
    get(messageId: string, defaultHeight: number = MESSAGE_ITEM_HEIGHTS.default): number {
        return this.cache.has(messageId) ? this.cache.get(messageId)! : defaultHeight;
    }

    /**
     * Store the height of a message in the cache
     * @param messageId - The ID of the message
     * @param height - The height of the message
     */
    set(messageId: string, height: number): void {
        this.cache.set(messageId, height);
    }

    /**
     * Check if a message height exists in the cache
     * @param messageId - The ID of the message
     * @returns True if the message height exists in the cache
     */
    has(messageId: string): boolean {
        return this.cache.has(messageId);
    }

    /**
     * Clear the cache
     */
    clear(): void {
        this.cache.clear();
    }

    /**
     * Get the size of the cache
     * @returns The number of items in the cache
     */
    size(): number {
        return this.cache.size;
    }
}

// Singleton instance of the message height cache
export const messageHeightCache = new MessageHeightCache();

/**
 * Calculate the height of a message based on its content
 * @param message - The message object
 * @returns The calculated height
 */
export function calculateMessageHeight(message: any): number {
    const { _id, type, message: content } = message;

    // Use cached height if available
    if (messageHeightCache.has(_id)) {
        return messageHeightCache.get(_id);
    }

    // Get base height for message type
    let height = MESSAGE_ITEM_HEIGHTS[type] || MESSAGE_ITEM_HEIGHTS.default;

    // Adjust height for text messages based on content length
    if (type === 'text' && content) {
        const messageLength = content.length;
        // Estimate 20 chars per line, each line ~20px height
        const estimatedLines = Math.ceil(messageLength / 20);
        height = Math.max(70, 20 + (estimatedLines * 20)); // Base height + content height
    }

    // Cache the calculated height
    messageHeightCache.set(_id, height);

    return height;
}

/**
 * Create a getItemLayout function for a FlatList with message items
 * @param data - The data array for the FlatList
 * @param index - The index of the item
 * @returns The layout information for the item at the given index
 */
export function createGetItemLayout(data: any[], index: number) {
    const item = data[index];
    if (!item) {
        return {
            length: MESSAGE_ITEM_HEIGHTS.default,
            offset: MESSAGE_ITEM_HEIGHTS.default * index,
            index
        };
    }

    // Calculate height for this item
    const height = calculateMessageHeight(item);

    // Calculate offset based on all previous items
    const offset = data.slice(0, index).reduce((acc, currentItem) => {
        return acc + calculateMessageHeight(currentItem);
    }, 0);

    return { length: height, offset, index };
}