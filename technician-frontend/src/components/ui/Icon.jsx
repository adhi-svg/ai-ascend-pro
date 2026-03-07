import * as LucideIcons from 'lucide-react'

export default function Icon({ 
  name, 
  size = 20, 
  className = '', 
  strokeWidth = 2,
  ...props 
}) {
  const IconComponent = LucideIcons[name]
  
  if (!IconComponent) {
    console.warn(`Icon "${name}" not found in lucide-react`)
    return null
  }
  
  return (
    <IconComponent 
      size={size} 
      strokeWidth={strokeWidth}
      className={`inline-block ${className}`}
      {...props}
    />
  )
}

// Export common Icon components for direct use
export const IconInfo = (props) => <Icon name="Info" {...props} />
export const IconCheck = (props) => <Icon name="Check" {...props} />
export const IconAlertCircle = (props) => <Icon name="AlertCircle" {...props} />
export const IconX = (props) => <Icon name="X" {...props} />
export const IconChevronRight = (props) => <Icon name="ChevronRight" {...props} />
export const IconChevronLeft = (props) => <Icon name="ChevronLeft" {...props} />
export const IconClock = (props) => <Icon name="Clock" {...props} />
export const IconMapPin = (props) => <Icon name="MapPin" {...props} />
export const IconDollarSign = (props) => <Icon name="DollarSign" {...props} />
export const IconUser = (props) => <Icon name="User" {...props} />
export const IconPhone = (props) => <Icon name="Phone" {...props} />
export const IconMail = (props) => <Icon name="Mail" {...props} />
export const IconBriefcase = (props) => <Icon name="Briefcase" {...props} />
export const IconStar = (props) => <Icon name="Star" {...props} />
export const IconArrowRight = (props) => <Icon name="ArrowRight" {...props} />
export const IconCalendar = (props) => <Icon name="Calendar" {...props} />
export const IconFilter = (props) => <Icon name="Filter" {...props} />
export const IconSearch = (props) => <Icon name="Search" {...props} />
export const IconMenu = (props) => <Icon name="Menu" {...props} />
export const IconLogOut = (props) => <Icon name="LogOut" {...props} />
export const IconSettings = (props) => <Icon name="Settings" {...props} />
export const IconHome = (props) => <Icon name="Home" {...props} />
export const IconTrendingUp = (props) => <Icon name="TrendingUp" {...props} />
export const IconCheckCircle = (props) => <Icon name="CheckCircle" {...props} />
export const IconXCircle = (props) => <Icon name="XCircle" {...props} />
export const IconZap = (props) => <Icon name="Zap" {...props} />
export const IconTool = (props) => <Icon name="Tool" {...props} />
export const IconWrench = (props) => <Icon name="Wrench" {...props} />
export const IconNavigation = (props) => <Icon name="Navigation" {...props} />
export const IconPhone2 = (props) => <Icon name="Phone" size={16} {...props} />
