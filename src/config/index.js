import MuseUI from 'muse-ui';
import 'muse-ui/dist/muse-ui.css';
import '@/assets/reset.scss';

export default Vue => {
    Vue.use(MuseUI);
    console.log(Vue.prototype);
};
