import React, { useState } from 'react';
import { Bell, Check, Trash2, X, Gift, TrendingUp, AlertCircle, Info } from 'lucide-react';
export function Notifications() {
  const [notifications, setNotifications] = useState([{
    id: 1,
    type: 'success',
    icon: Check,
    title: 'Token Purchase Successful',
    message: 'You successfully purchased 50,000 MVP tokens',
    time: '5 minutes ago',
    read: false
  }, {
    id: 2,
    type: 'info',
    icon: Gift,
    title: 'New Airdrop Available',
    message: 'Claim your 1,000 SVT tokens from the community airdrop',
    time: '1 hour ago',
    read: false
  }, {
    id: 3,
    type: 'warning',
    icon: AlertCircle,
    title: 'Token Sale Ending Soon',
    message: 'MetaVerse Pioneers token sale ends in 2 days',
    time: '3 hours ago',
    read: true
  }, {
    id: 4,
    type: 'info',
    icon: TrendingUp,
    title: 'Price Alert',
    message: 'SOL price increased by 5% in the last 24 hours',
    time: '1 day ago',
    read: true
  }, {
    id: 5,
    type: 'success',
    icon: Check,
    title: 'Staking Rewards Claimed',
    message: 'You claimed 250 SVT tokens from staking rewards',
    time: '2 days ago',
    read: true
  }]);
  const markAsRead = (id: number) => {
    setNotifications(notifications.map(n => n.id === id ? {
      ...n,
      read: true
    } : n));
  };
  const markAllAsRead = () => {
    setNotifications(notifications.map(n => ({
      ...n,
      read: true
    })));
  };
  const deleteNotification = (id: number) => {
    setNotifications(notifications.filter(n => n.id !== id));
  };
  const unreadCount = notifications.filter(n => !n.read).length;
  const getIconColor = (type: string) => {
    switch (type) {
      case 'success':
        return 'text-[#3b82f6]';
      case 'warning':
        return 'text-[#a0a0a0]';
      case 'info':
        return 'text-[#3b82f6]';
      default:
        return 'text-[#a0a0a0]';
    }
  };
  return <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-[#e0e0e0]">
            Notifications
          </h1>
          <p className="mt-1 text-sm text-[#a0a0a0]">
            {unreadCount > 0 ? `You have ${unreadCount} unread notification${unreadCount > 1 ? 's' : ''}` : 'All caught up!'}
          </p>
        </div>
        {unreadCount > 0 && <button onClick={markAllAsRead} className="px-4 py-2 text-xs font-medium text-[#e0e0e0] bg-[#1a1a1a] hover:bg-[#222] border border-[#1f1f1f] rounded-lg transition-colors">
            Mark all as read
          </button>}
      </div>

      <div className="space-y-3">
        {notifications.length === 0 ? <div className="bg-[#121212] border border-[#1f1f1f] rounded-lg p-8 text-center">
            <div className="bg-[#1a1a1a] p-3 rounded-full w-12 h-12 flex items-center justify-center mx-auto mb-3">
              <Bell className="h-6 w-6 text-[#707070]" />
            </div>
            <h3 className="text-sm font-medium text-[#e0e0e0] mb-1">
              No notifications
            </h3>
            <p className="text-xs text-[#707070]">
              You're all caught up! Check back later for updates.
            </p>
          </div> : notifications.map(notification => {
        const Icon = notification.icon;
        return <div key={notification.id} className={`bg-[#121212] border rounded-lg p-4 transition-all ${notification.read ? 'border-[#1f1f1f]' : 'border-[#3b82f6] bg-[#3b82f6]/5'}`}>
                <div className="flex items-start gap-4">
                  <div className={`bg-[#1a1a1a] p-2 rounded-lg ${getIconColor(notification.type)}`}>
                    <Icon className="h-4 w-4" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1">
                        <h3 className="text-sm font-semibold text-[#e0e0e0] mb-1">
                          {notification.title}
                        </h3>
                        <p className="text-xs text-[#a0a0a0] mb-2">
                          {notification.message}
                        </p>
                        <p className="text-[10px] text-[#707070]">
                          {notification.time}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        {!notification.read && <button onClick={() => markAsRead(notification.id)} className="p-1.5 text-[#3b82f6] hover:bg-[#1a1a1a] rounded transition-colors" title="Mark as read">
                            <Check className="h-3.5 w-3.5" />
                          </button>}
                        <button onClick={() => deleteNotification(notification.id)} className="p-1.5 text-[#a0a0a0] hover:text-[#e0e0e0] hover:bg-[#1a1a1a] rounded transition-colors" title="Delete">
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>;
      })}
      </div>
    </div>;
}
export default Notifications;