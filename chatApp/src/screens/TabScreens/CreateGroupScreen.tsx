// import React, { useState } from 'react';
// import {
//   View,
//   Text,
//   TextInput,
//   Alert,
//   StyleSheet,
//   ScrollView,
//   Pressable,
// } from 'react-native';
// import { useNavigation } from '@react-navigation/native';
// import { createGroup, currentUser } from '../../services/firebase';
// import { globalStyles, colors } from '../../utils/styles';
// import Header from '../../components/Header';
// import Layout from '../Layout';

// const CreateGroupScreen = () => {
//   const [name, setName] = useState('');
//   const [description, setDescription] = useState('');
//   const [loading, setLoading] = useState(false);
//   const navigation: any = useNavigation();
//   const user: any = currentUser();

//   // if (!user?.isAdmin) {
//   //   return (
//   //     <Layout statusBarColor={colors.primary}>
//   //       <View style={[globalStyles.center, { flex: 1 }]}>
//   //         <Text style={{ color: colors.text, fontSize: 16 }}>
//   //           🚫 Only admins can create groups.
//   //         </Text>
//   //       </View>
//   //     </Layout>
//   //   );
//   // }

//   const handleCreate = async () => {
//     if (!name.trim() || name.length < 3) {
//       Alert.alert('Error', 'Group name must be at least 3 characters.');
//       return;
//     }
//     setLoading(true);
//     try {
//       await createGroup(name.trim(), description.trim(), user.uid);
//       Alert.alert('Success', `Group "${name}" created!`);
//       navigation.goBack();
//     } catch (error: any) {
//       Alert.alert('Error', error.message);
//     }
//     setLoading(false);
//   };

//   return (
//     <Layout statusBarColor={colors.primary}>
//       <View style={globalStyles.container}>
//         <Header title="Create Group" onBack={() => navigation.goBack()} />
//         <ScrollView contentContainerStyle={styles.container}>
//           <View style={styles.card}>
//             <Text style={styles.label}>Group Name *</Text>
//             <TextInput
//               style={styles.input}
//               placeholder="Enter group name"
//               placeholderTextColor={colors.textSecondary}
//               value={name}
//               onChangeText={setName}
//             />
//             <Text style={styles.label}>Description</Text>
//             <TextInput
//               style={[styles.input, { height: 100 }]}
//               placeholder="Write something about this group..."
//               placeholderTextColor={colors.textSecondary}
//               multiline
//               value={description}
//               onChangeText={setDescription}
//             />
//             <Pressable
//               style={[styles.button, loading && { opacity: 0.7 }]}
//               onPress={handleCreate}
//               disabled={loading}
//             >
//               <Text style={styles.buttonText}>
//                 {loading ? 'Creating...' : 'Create Group'}
//               </Text>
//             </Pressable>
//           </View>
//         </ScrollView>
//       </View>
//     </Layout>
//   );
// };

// const styles = StyleSheet.create({
//   container: { padding: 20 },
//   card: {
//     backgroundColor: '#fff',
//     borderRadius: 12,
//     padding: 20,
//     shadowColor: '#000',
//     shadowOpacity: 0.05,
//     shadowRadius: 3,
//     elevation: 2,
//   },
//   label: {
//     color: colors.text,
//     fontWeight: '600',
//     marginBottom: 5,
//     fontSize: 14,
//   },
//   input: {
//     borderWidth: 1,
//     borderColor: colors.textSecondary,
//     borderRadius: 8,
//     padding: 10,
//     marginBottom: 15,
//     color: colors.text,
//   },
//   button: {
//     backgroundColor: colors.primary,
//     paddingVertical: 12,
//     borderRadius: 8,
//     alignItems: 'center',
//   },
//   buttonText: { color: '#fff', fontWeight: '700', fontSize: 15 },
// });

// export default CreateGroupScreen;

// src/screens/main/CreateGroupScreen.tsx
import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  Alert,
  StyleSheet,
  ScrollView,
  Pressable,
  TouchableOpacity,
  Modal,
  FlatList,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { createGroup, currentUser } from '../../services/firebase';
import { globalStyles, colors } from '../../utils/styles';
import Header from '../../components/Header';
import Layout from '../Layout';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

const categoryOptions = [
  { label: 'Sports', value: 'sports' },
  { label: 'Study', value: 'study' },
  { label: 'Music', value: 'music' },
  { label: 'Gaming', value: 'gaming' },
  { label: 'Movies', value: 'movies' },
  { label: 'Technology', value: 'tech' },
  { label: 'Travel', value: 'travel' },
  { label: 'Other', value: 'other' },
];

const CategoryDropdown = ({
  value,
  onValueChange,
  placeholder = 'Select a category...',
}: {
  value: string;
  onValueChange: (val: string) => void;
  placeholder?: string;
}) => {
  const [open, setOpen] = useState(false);

  return (
    <>
      <TouchableOpacity
        activeOpacity={0.8}
        style={styles.dropdownButton}
        onPress={() => setOpen(true)}
      >
        <Text
          style={[styles.dropdownText, !value && styles.dropdownPlaceholder]}
        >
          {value
            ? categoryOptions.find(c => c.value === value)?.label || value
            : placeholder}
        </Text>
        <Icon name="chevron-down" size={20} color={colors.textSecondary} />
      </TouchableOpacity>

      <Modal
        visible={open}
        transparent
        animationType="fade"
        statusBarTranslucent={true}
        onRequestClose={() => setOpen(false)}
      >
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setOpen(false)}
        >
          <View style={styles.modalContent}>
            <FlatList
              data={categoryOptions}
              keyExtractor={item => item.value}
              showsVerticalScrollIndicator={false}
              renderItem={({ item }) => (
                <Pressable
                  style={styles.modalItem}
                  onPress={() => {
                    onValueChange(item.value);
                    setOpen(false);
                  }}
                >
                  <Text style={styles.modalItemText}>{item.label}</Text>
                </Pressable>
              )}
              ListHeaderComponent={() => (
                <View style={styles.modalHeader}>
                  <Text style={styles.modalHeaderText}>Choose category</Text>
                </View>
              )}
            />
          </View>
        </TouchableOpacity>
      </Modal>
    </>
  );
};

const CreateGroupScreen = () => {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('');
  const [loading, setLoading] = useState(false);
  const navigation: any = useNavigation();
  const user: any = currentUser();

  const handleCreate = async () => {
    if (!name.trim() || name.length < 3) {
      Alert.alert('Error', 'Group name must be at least 3 characters.');
      return;
    }
    if (!category) {
      Alert.alert('Error', 'Please select a category.');
      return;
    }
    setLoading(true);
    try {
      await createGroup(name.trim(), description.trim(), user.uid, category);
      Alert.alert('Success', `Group "${name}" created!`);
      navigation.goBack();
    } catch (error: any) {
      Alert.alert('Error', error.message);
    }
    setLoading(false);
  };

  return (
    <Layout statusBarColor={colors.primary}>
      <View style={globalStyles.container}>
        <Header title="Create Group" onBack={() => navigation.goBack()} />
        <ScrollView contentContainerStyle={styles.container}>
          <View style={styles.card}>
            {/* Group Name */}
            <Text style={styles.label}>Group Name *</Text>
            <TextInput
              style={styles.input}
              placeholder="Enter group name"
              placeholderTextColor={colors.textSecondary}
              value={name}
              onChangeText={setName}
            />

            {/* Category */}
            <Text style={styles.label}>Category *</Text>
            <CategoryDropdown value={category} onValueChange={setCategory} />

            {/* Description */}
            <Text style={styles.label}>Description</Text>
            <TextInput
              style={[styles.input, { height: 100 }]}
              placeholder="Write something about this group..."
              placeholderTextColor={colors.textSecondary}
              multiline
              value={description}
              onChangeText={setDescription}
            />

            {/* Button */}
            <Pressable
              style={[styles.button, loading && { opacity: 0.7 }]}
              onPress={handleCreate}
              disabled={loading}
            >
              <Text style={styles.buttonText}>
                {loading ? 'Creating...' : 'Create Group'}
              </Text>
            </Pressable>
          </View>
        </ScrollView>
      </View>
    </Layout>
  );
};

const styles = StyleSheet.create({
  container: { padding: 20 },
  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
  },
  label: {
    color: colors.text,
    fontWeight: '600',
    marginBottom: 5,
    fontSize: 14,
  },
  input: {
    borderWidth: 1,
    borderColor: colors.textSecondary,
    borderRadius: 8,
    padding: 10,
    marginBottom: 15,
    color: colors.text,
  },
  pickerContainer: {
    borderWidth: 1,
    borderColor: colors.textSecondary,
    borderRadius: 8,
    marginBottom: 15,
    paddingHorizontal: 8,
  },
  button: {
    backgroundColor: colors.primary,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  buttonText: { color: '#fff', fontWeight: '700', fontSize: 15 },

  /* Dropdown styles */
  dropdownButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1,
    borderColor: colors.textSecondary,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 12,
    marginBottom: 15,
    backgroundColor: '#fff',
  },
  dropdownText: {
    fontSize: 14,
    color: colors.text,
  },
  dropdownPlaceholder: {
    color: colors.textSecondary,
  },

  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.35)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    maxHeight: '60%',
    backgroundColor: '#fff',
    borderTopLeftRadius: 12,
    borderTopRightRadius: 12,
    paddingBottom: 50,
  },
  modalHeader: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  modalHeaderText: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.text,
  },
  modalItem: {
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f2f2f2',
  },
  modalItemText: {
    fontSize: 15,
    color: colors.text,
  },
});

export default CreateGroupScreen;
