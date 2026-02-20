import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  Dimensions,
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import Layout from '../Layout';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import AppHeader from '../../components/AppHeader';
import { GradientButton } from '../../components/UI/Button';
import { useTheme } from '@react-navigation/native';
import apiService from '../../api/apiService';
import { showError } from '../../utils/ToastMessage';
import { typography } from '../../theme';
import { getChatId, initializeChatDoc } from '../../services/firebase';
import auth from '@react-native-firebase/auth';

const tabs = ['Posts', 'Saved', 'Tagged'];

const ProfileScreen = ({ navigation, route }: any) => {
  const username = route.params?.username;
  const insets = useSafeAreaInsets();
  const [activeTab, setActiveTab] = useState('Posts');
  const { colors }: any = useTheme();
  const [profileData, setProfileData] = useState<any>({});
  const [loading, setLoading] = useState(false);

  const fetchProfile = async () => {
    setLoading(true);
    try {
      const res = await apiService.getOtherUserProfile({
        username: username,
      });

      if (res?.success) {
        setProfileData(res?.user);
      } else {
        showError('Failed to fetch profile');
      }
    } catch (error) {
      console.log('Error in GET PROFILE', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  const handleStartChat = async () => {
    try {
      const currentUid = auth().currentUser?.uid;
      if (!currentUid) {
        showError('You must be logged in to start a chat');
        return;
      }

      const otherUid = profileData._id.toString(); // Assuming profileData._id is the Mongo ID
      const chatId = getChatId(currentUid, otherUid);
      const participants = [currentUid, otherUid];

      // Initialize chat doc if not exists
      await initializeChatDoc(chatId, participants);

      // Navigate to chat screen (adjust route name and params as needed)
      navigation.navigate('Chat', {
        chatId,
        otherUser: {
          uid: otherUid,
          name: profileData.name,
          username: profileData.username,
          // Add other details if needed
        },
      });
    } catch (error) {
      console.error('Error starting chat:', error);
      showError('Failed to start chat');
    }
  };

  return (
    <Layout paddingTop={insets.top}>
      <AppHeader
        isLogo={false}
        title={'@' + profileData?.username}
        rightIcon1={<Icon name="menu" size={24} color="#7b8cff" />}
      />

      <View style={styles.avatarWrapper}>
        <Image
          source={
            profileData?.profilePicture
              ? { uri: profileData?.profilePicture }
              : require('../../../assets/images/default-user.png')
          }
          style={styles.avatar}
        />
        <View style={styles.plusIconWrapper}>
          <Icon name="add" size={16} color="#fff" />
        </View>
      </View>

      <Text
        style={{
          ...typography.Montserrat_Bold20,
          color: colors.Text_Primary_Color,
          textAlign: 'center',
        }}
      >
        {profileData?.name}
      </Text>
      <Text style={styles.role}>Director & CEO of Lumora</Text>

      <Text
        style={{
          ...typography.Montserrat_Regular14,
          color: colors.Text_Secondary_Color,
          textAlign: 'center',
          marginTop: 4,
        }}
      >
        {profileData?.bio ?? ''}
        <Text
          style={{
            ...typography.Montserrat_Regular14,
            color: colors.Colored_Text,
          }}
        >
          {' '}
          linktr.ee/lumora
        </Text>
      </Text>

      <View style={styles.statsRow}>
        <View style={styles.statItem}>
          <Text style={styles.statNumber}>
            {profileData?.followersCount ?? 0}
          </Text>
          <Text
            style={{
              ...typography.Montserrat_SemiBold12,
              color: colors.Colored_Text,
            }}
          >
            FOLLOWERS
          </Text>
        </View>
        <View style={styles.statItem}>
          <Text style={styles.statNumber}>
            {profileData?.followingCount ?? 0}
          </Text>
          <Text
            style={{
              ...typography.Montserrat_SemiBold12,
              color: colors.Colored_Text,
            }}
          >
            FOLLOWING
          </Text>
        </View>
        <View style={styles.statItem}>
          <Text style={styles.statNumber}>1.2M</Text>
          <Text
            style={{
              ...typography.Montserrat_SemiBold12,
              color: colors.Colored_Text,
            }}
          >
            LIKES
          </Text>
        </View>
      </View>

      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          gap: 10,
          marginHorizontal: 16,
          marginTop: 16,
        }}
      >
        <View style={{ flex: 1 }}>
          <GradientButton title="Follow" onPress={() => {}} />
        </View>

        <TouchableOpacity
          onPress={handleStartChat}
          style={{
            backgroundColor: colors.Linear_Gradient_1,
            width: 48,
            height: 48,
            borderRadius: 50,
            justifyContent: 'center',
            alignItems: 'center',
          }}
        >
          <Icon name="chatbubble-ellipses-outline" size={24} color="#fff" />
        </TouchableOpacity>
      </View>

      {/* Tabs Row */}
      <View style={styles.tabsRow}>
        {tabs.map(tab => (
          <TouchableOpacity
            key={tab}
            style={styles.tabItem}
            onPress={() => setActiveTab(tab)}
          >
            <Text
              style={[
                styles.tabText,
                activeTab === tab && styles.activeTabText,
              ]}
            >
              {tab}
            </Text>
            {activeTab === tab && <View style={styles.activeIndicator} />}
          </TouchableOpacity>
        ))}
      </View>

      {/* TODO: Render tab content based on activeTab */}
    </Layout>
  );
};

export default ProfileScreen;

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 14,
    paddingVertical: 12,
    alignItems: 'center',
  },

  avatarWrapper: {
    alignSelf: 'center',
    marginTop: 14,
    marginBottom: 12,
  },
  avatar: {
    width: 90,
    height: 90,
    borderRadius: 50,
    borderWidth: 3,
    borderColor: '#7b8cff',
  },
  plusIconWrapper: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    backgroundColor: '#7b8cff',
    width: 24,
    height: 24,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#111a30',
  },

  role: {
    color: '#7b8cff',
    fontWeight: '600',
    fontSize: 14,
    marginTop: 4,
    textAlign: 'center',
  },
  bio: {
    color: '#bbb',
    fontSize: 13,
    marginHorizontal: 28,
    marginTop: 8,
    textAlign: 'center',
    lineHeight: 18,
  },
  link: {
    color: '#7b8cff',
    fontWeight: '600',
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-evenly',
    marginTop: 18,
    paddingHorizontal: 20,
  },
  statItem: {
    alignItems: 'center',
  },
  statNumber: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 18,
  },
  statLabel: {
    color: '#7b8cff',
    fontWeight: '600',
    fontSize: 11,
    marginTop: 2,
  },
  editProfileBtn: {
    backgroundColor: '#7b8cff',
    marginHorizontal: 50,
    marginTop: 18,
    borderRadius: 24,
    paddingVertical: 10,
    alignItems: 'center',
  },
  editProfileText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 16,
  },

  tabsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: 20,
    borderBottomWidth: 0.5,
    borderBottomColor: '#555',
  },
  tabItem: {
    alignItems: 'center',
    paddingVertical: 10,
  },
  tabText: {
    color: '#aaa',
    fontSize: 14,
    fontWeight: '600',
  },
  activeTabText: {
    color: '#7b8cff',
  },
  activeIndicator: {
    marginTop: 6,
    height: 2,
    width: 24,
    backgroundColor: '#7b8cff',
    borderRadius: 1,
  },
});
