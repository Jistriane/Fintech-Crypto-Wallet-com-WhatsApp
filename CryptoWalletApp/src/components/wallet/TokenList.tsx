import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, FlatList } from 'react-native';
import { Card } from '../common/Card';

interface Token {
  id: string;
  symbol: string;
  name: string;
  balance: string;
  balanceUSD: string;
  change24h: string;
  logoUrl: string;
}

interface TokenListProps {
  tokens: Token[];
  onTokenPress: (token: Token) => void;
}

export const TokenList: React.FC<TokenListProps> = ({ tokens, onTokenPress }) => {
  const renderToken = ({ item }: { item: Token }) => {
    const isPositiveChange = parseFloat(item.change24h) >= 0;

    return (
      <TouchableOpacity
        style={styles.tokenContainer}
        onPress={() => onTokenPress(item)}
      >
        <View style={styles.tokenInfo}>
          <Image
            source={{ uri: item.logoUrl }}
            style={styles.tokenLogo}
          />
          <View>
            <Text style={styles.tokenSymbol}>{item.symbol}</Text>
            <Text style={styles.tokenName}>{item.name}</Text>
          </View>
        </View>
        <View style={styles.tokenValues}>
          <Text style={styles.tokenBalance}>
            {item.balance} {item.symbol}
          </Text>
          <Text style={styles.tokenBalanceUSD}>{item.balanceUSD}</Text>
          <Text
            style={[
              styles.tokenChange,
              isPositiveChange ? styles.positiveChange : styles.negativeChange
            ]}
          >
            {isPositiveChange ? '+' : ''}{item.change24h}%
          </Text>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <Card style={styles.container}>
      <Text style={styles.title}>Seus Tokens</Text>
      <FlatList
        data={tokens}
        renderItem={renderToken}
        keyExtractor={(item) => item.id}
        showsVerticalScrollIndicator={false}
        ItemSeparatorComponent={() => <View style={styles.separator} />}
        contentContainerStyle={styles.listContent}
      />
    </Card>
  );
};

const styles = StyleSheet.create({
  container: {
    marginHorizontal: 16,
    marginVertical: 8,
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 16,
  },
  tokenContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
  },
  tokenInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  tokenLogo: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 12,
  },
  tokenSymbol: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1f2937',
  },
  tokenName: {
    fontSize: 14,
    color: '#6b7280',
  },
  tokenValues: {
    alignItems: 'flex-end',
  },
  tokenBalance: {
    fontSize: 14,
    color: '#1f2937',
  },
  tokenBalanceUSD: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1f2937',
    marginTop: 2,
  },
  tokenChange: {
    fontSize: 14,
    fontWeight: '500',
    marginTop: 2,
  },
  positiveChange: {
    color: '#10b981',
  },
  negativeChange: {
    color: '#ef4444',
  },
  separator: {
    height: 1,
    backgroundColor: '#e5e7eb',
  },
  listContent: {
    paddingBottom: 8,
  },
});
