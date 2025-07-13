import { ModerationService } from '../types/moderation';

export const handleHasModServices = (
  isSignedIn: boolean,
  services: ModerationService[] | []
) => {
  if (!isSignedIn) return false;
  // a bit of a hack to make development easier for devs who don't have a blacksky account to moderate against
  // this will create logs that say the action was sent to ozone, but ozone has not been integrated yet so no actions will be taken
  if (process.env.NODE_ENV === 'development' && services.length > 0) {
    return true;
  }

  const filteredServices = services.filter((service) => {
    return service.value !== 'ozone';
  });
  return filteredServices.length > 0;
};
