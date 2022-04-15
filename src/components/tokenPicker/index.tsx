import React, {useState} from 'react';
import {
  TouchableOpacity,
  View,
  Text,
  Modal,
  ScrollView,
  TextInput,
  ActivityIndicator,
} from 'react-native';
import {styles} from './styles';
import Icon from 'react-native-vector-icons/MaterialIcons';
import {TokenIcon} from '../TokenIcon';

interface TokenData {
  img: string;
  symbol: string;
}
export const TokenPicker = ({
  value,
  tokens = [],
  loading,
  onChange,
  showIconOnly = false,
}: {
  value?: TokenData;
  loading?: boolean;
  showIconOnly?: boolean;
  tokens: TokenData[];
  onChange: (value: TokenData) => void;
}) => {
  const [visible, setVisible] = useState(false);
  const [filter, setFilter] = useState('');

  const onSelect = (d: TokenData) => {
    onChange(d);
    setVisible(false);
  };

  return (
    <View>
      <TouchableOpacity
        style={[styles.content, showIconOnly && styles.contentNoShadow]}
        onPress={() => setVisible(true)}>
        {!showIconOnly && (
          <React.Fragment>
            {!!value && (
              <View style={styles.logoContainer}>
                <View style={styles.logoWrap}>
                  <TokenIcon uri={value.img} width={20} height={20} />
                </View>
              </View>
            )}
            <Text style={[styles.name, !value && styles.nameSelect]}>
              {value ? value.symbol : 'Select a token'}
            </Text>
          </React.Fragment>
        )}
        <Icon name="keyboard-arrow-down" size={showIconOnly ? 30 : 20} />
      </TouchableOpacity>
      <Modal animationType="slide" visible={visible} transparent={true}>
        <TouchableOpacity
          activeOpacity={1}
          style={styles.modalWrap}
          onPress={() => setVisible(false)}>
          <TouchableOpacity activeOpacity={1} style={styles.modal}>
            <Text style={styles.modalTitle}>Select a token</Text>
            <View style={styles.filterWrap}>
              <TextInput
                value={filter}
                onChangeText={t => setFilter(t)}
                style={styles.filter}
                placeholder="Search name"
              />
            </View>
            <ScrollView>
              {loading ? (
                <ActivityIndicator />
              ) : (
                <React.Fragment>
                  {!!tokens &&
                    tokens
                      .filter(t =>
                        filter
                          ? t.symbol
                              ?.toLowerCase()
                              .includes(filter.toLowerCase())
                          : t,
                      )
                      .slice(0, 50)
                      .map(t => (
                        <TouchableOpacity
                          key={t.symbol}
                          style={styles.item}
                          onPress={() => onSelect(t)}>
                          <View style={styles.itemLogoContainer}>
                            <View style={styles.itemLogoWrap}>
                              <TokenIcon uri={t.img} width={25} height={25} />
                            </View>
                          </View>
                          <View>
                            <Text style={styles.name}>{t.symbol}</Text>
                          </View>
                        </TouchableOpacity>
                      ))}
                </React.Fragment>
              )}
            </ScrollView>
          </TouchableOpacity>
        </TouchableOpacity>
      </Modal>
    </View>
  );
};
