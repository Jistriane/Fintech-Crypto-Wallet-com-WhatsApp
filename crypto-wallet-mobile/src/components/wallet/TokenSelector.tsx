import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  FlatList,
  Image,
  TextInput,
} from 'react-native';
import { useTheme } from '@/providers/ThemeProvider';
import { Token } from '@/types/wallet';
import { Card } from '@/components/common/Card';
import { Ionicons } from '@expo/vector-icons';

interface TokenSelectorProps {
  tokens: Token[];
  selectedToken?: Token;
  onSelect: (token: Token) => void;
}

export function TokenSelector({
  tokens,
  selectedToken,
  onSelect,
}: TokenSelectorProps) {
  const { colors, typography, spacing } = useTheme();
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const filteredTokens = tokens.filter(
    (token) =>
      token.symbol.toLowerCase().includes(searchQuery.toLowerCase()) ||
      token.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const renderToken = ({ item }: { item: Token }) => (
    <TouchableOpacity
      onPress={() => {
        onSelect(item);
        setIsModalVisible(false);
      }}
      style={[
        styles.tokenItem,
        {
          backgroundColor:
            selectedToken?.address === item.address
              ? colors.primary[50]
              : 'transparent',
        },
      ]}
    >
      <View style={styles.tokenInfo}>
        {item.logoUrl ? (
          <Image source={{ uri: item.logoUrl }} style={styles.tokenLogo} />
        ) : (
          <View
            style={[
              styles.placeholderLogo,
              { backgroundColor: colors.primary[100] },
            ]}
          >
            <Text
              style={[
                typography.body2,
                { color: colors.primary[500] },
              ]}
            >
              {item.symbol.slice(0, 2)}
            </Text>
          </View>
        )}
        <View style={{ marginLeft: spacing.sm }}>
          <Text
            style={[
              typography.body1,
              { color: colors.text.light, fontWeight: '600' },
            ]}
          >
            {item.symbol}
          </Text>
          <Text
            style={[
              typography.caption,
              { color: colors.secondary[500] },
            ]}
          >
            {item.name}
          </Text>
        </View>
      </View>

      <View style={styles.tokenNetwork}>
        <Text
          style={[
            typography.caption,
            { color: colors.secondary[500] },
          ]}
        >
          {item.network}
        </Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <>
      <TouchableOpacity
        onPress={() => setIsModalVisible(true)}
        activeOpacity={0.7}
      >
        <Card variant="outlined" style={styles.selector}>
          {selectedToken ? (
            <View style={styles.selectedToken}>
              {selectedToken.logoUrl ? (
                <Image
                  source={{ uri: selectedToken.logoUrl }}
                  style={styles.tokenLogo}
                />
              ) : (
                <View
                  style={[
                    styles.placeholderLogo,
                    { backgroundColor: colors.primary[100] },
                  ]}
                >
                  <Text
                    style={[
                      typography.body2,
                      { color: colors.primary[500] },
                    ]}
                  >
                    {selectedToken.symbol.slice(0, 2)}
                  </Text>
                </View>
              )}
              <Text
                style={[
                  typography.body1,
                  {
                    color: colors.text.light,
                    fontWeight: '600',
                    marginLeft: spacing.sm,
                  },
                ]}
              >
                {selectedToken.symbol}
              </Text>
            </View>
          ) : (
            <Text
              style={[
                typography.body1,
                { color: colors.secondary[500] },
              ]}
            >
              Selecionar token
            </Text>
          )}
          <Ionicons
            name="chevron-down"
            size={20}
            color={colors.secondary[500]}
          />
        </Card>
      </TouchableOpacity>

      <Modal
        visible={isModalVisible}
        animationType="slide"
        transparent={true}
      >
        <View
          style={[
            styles.modalContainer,
            { backgroundColor: colors.background.light },
          ]}
        >
          <View style={styles.modalHeader}>
            <Text
              style={[
                typography.h2,
                { color: colors.text.light },
              ]}
            >
              Selecionar token
            </Text>
            <TouchableOpacity
              onPress={() => setIsModalVisible(false)}
              hitSlop={{ top: 10, right: 10, bottom: 10, left: 10 }}
            >
              <Ionicons
                name="close"
                size={24}
                color={colors.secondary[500]}
              />
            </TouchableOpacity>
          </View>

          <View
            style={[
              styles.searchContainer,
              {
                backgroundColor: colors.background.light,
                borderColor: colors.border.light,
              },
            ]}
          >
            <Ionicons
              name="search"
              size={20}
              color={colors.secondary[500]}
            />
            <TextInput
              value={searchQuery}
              onChangeText={setSearchQuery}
              placeholder="Buscar token"
              placeholderTextColor={colors.secondary[500]}
              style={[
                typography.body1,
                {
                  color: colors.text.light,
                  flex: 1,
                  marginLeft: spacing.sm,
                },
              ]}
            />
          </View>

          <FlatList
            data={filteredTokens}
            renderItem={renderToken}
            keyExtractor={(item) => item.address}
            contentContainerStyle={styles.tokenList}
            showsVerticalScrollIndicator={false}
          />
        </View>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  selector: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 12,
  },
  selectedToken: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  tokenLogo: {
    width: 24,
    height: 24,
    borderRadius: 12,
  },
  placeholderLogo: {
    width: 24,
    height: 24,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContainer: {
    flex: 1,
    paddingTop: 44,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingBottom: 16,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderWidth: 1,
    borderRadius: 8,
    marginHorizontal: 16,
    marginBottom: 16,
  },
  tokenList: {
    paddingHorizontal: 16,
  },
  tokenItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
  },
  tokenInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  tokenNetwork: {
    alignItems: 'flex-end',
  },
});
