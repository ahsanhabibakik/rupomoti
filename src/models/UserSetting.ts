import mongoose, { Schema, Document } from 'mongoose';

export interface IUserSetting extends Document {
  userId: string;
  emailNotifications: {
    orderUpdates: boolean;
    promotionalEmails: boolean;
    newsletter: boolean;
  };
  smsNotifications: {
    orderUpdates: boolean;
    promotionalSms: boolean;
  };
  privacySettings: {
    profileVisibility: 'public' | 'private';
    showEmail: boolean;
    showPhone: boolean;
  };
  createdAt: Date;
  updatedAt: Date;
}

const UserSettingSchema = new Schema<IUserSetting>({
  userId: {
    type: String,
    required: true,
    unique: true,
    index: true,
  },
  emailNotifications: {
    orderUpdates: {
      type: Boolean,
      default: true,
    },
    promotionalEmails: {
      type: Boolean,
      default: false,
    },
    newsletter: {
      type: Boolean,
      default: false,
    },
  },
  smsNotifications: {
    orderUpdates: {
      type: Boolean,
      default: true,
    },
    promotionalSms: {
      type: Boolean,
      default: false,
    },
  },
  privacySettings: {
    profileVisibility: {
      type: String,
      enum: ['public', 'private'],
      default: 'public',
    },
    showEmail: {
      type: Boolean,
      default: false,
    },
    showPhone: {
      type: Boolean,
      default: false,
    },
  },
}, {
  timestamps: true,
});

export default mongoose.models.UserSetting || mongoose.model<IUserSetting>('UserSetting', UserSettingSchema);