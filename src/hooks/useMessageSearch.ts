import { useCallback, useMemo } from 'react';
import { useAtom, useAtomValue } from 'jotai';
import {
    chatSearchEnabledAtom,
    chatSearchPaginationIndexAtom,
    chatSearchResultAtom,
    chatSearchTextMessage,
} from '@Atoms/ChatMessageEvents';
import _ from 'lodash';

/**
 * Custom hook for handling message search functionality
 * 
 * @param conversation - The conversation messages array
 * @param flatListRef - Reference to the FlatList component
 * @returns Search related functions and state
 */
export const useMessageSearch = (
    conversation: any[],
    flatListRef: React.RefObject<any>
) => {
    const searchEnabled = useAtomValue(chatSearchEnabledAtom);
    const [searchResults, setSearchResults] = useAtom(chatSearchResultAtom);
    const searchPaginationIndex = useAtomValue(chatSearchPaginationIndexAtom);
    const searchText = useAtomValue(chatSearchTextMessage);

    // Build optimized search index
    const searchIndex = useMemo(() => {
        if (!searchText || searchText.length === 0) {
            return [];
        }

        return conversation.reduce((indices, message, index) => {
            if (
                message.message &&
                typeof message.message === 'string' &&
                message.message.toLowerCase().includes(searchText.toLowerCase())
            ) {
                indices.push(index);
            }
            return indices;
        }, []);
    }, [conversation, searchText]);

    // Update search results when index changes
    useMemo(() => {
        if (searchIndex.length !== searchResults.length) {
            setSearchResults(searchIndex);
        }
    }, [searchIndex, searchResults, setSearchResults]);

    // Scroll to the active search result
    const scrollToSearchResult = useCallback(() => {
        if (
            searchEnabled &&
            searchText.length > 0 &&
            searchResults.length > 0 &&
            searchPaginationIndex >= 0 &&
            searchPaginationIndex < searchResults.length
        ) {
            const targetIndex = searchResults[searchPaginationIndex];

            if (targetIndex >= 0 && flatListRef?.current) {
                // Add a small delay to ensure the list has rendered
                setTimeout(() => {
                    flatListRef.current.scrollToIndex({
                        index: targetIndex,
                        animated: true,
                        viewPosition: 0.5, // Center the item
                    });
                }, 100);
            }
        }
    }, [
        searchEnabled,
        searchText,
        searchResults,
        searchPaginationIndex,
        flatListRef
    ]);

    // Debounced search to improve performance
    const performSearch = useCallback(
        _.debounce(() => {
            scrollToSearchResult();
        }, 300),
        [scrollToSearchResult]
    );

    return {
        searchEnabled,
        searchText,
        searchResults,
        searchPaginationIndex,
        performSearch,
        scrollToSearchResult
    };
};